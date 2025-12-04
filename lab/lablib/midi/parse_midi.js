import { MIDIFile, MIDIFormat, MIDIHeader, MIDITrack } from "./MidiFile.js";

// this is for the littleEndian flag in DataView.getXXXX() functions
const BIG_ENDIAN = false;

// 4 bytes for the chunk type string + u32 length
const CHUNK_HEADER_LENGTH = 8;

// MIDI only uses the ASCII portion of this, but close enough
const UTF8 = new TextDecoder("utf-8");

/**
 * Raw MIDI chunk
 * @typedef {{chunk_type: string, payload: DataView}} MIDIChunk
 */

/**
 * Split a raw MIDI file into chunks
 * @param {ArrayBuffer} midi_buffer the whole MIDI file as an ArrayBuffer
 * @returns {MIDIChunk[]} The individual chunks as an array.
 */
function parse_midi_chunks(midi_buffer) {
  const whole_file = new DataView(midi_buffer);

  // split the file into chunks
  const chunks = [];
  let offset = 0;
  while (offset < midi_buffer.byteLength) {
    const chunk_type = UTF8.decode(new Uint8Array(midi_buffer, offset, 4));
    const chunk_length = whole_file.getUint32(offset + 4, BIG_ENDIAN);

    const chunk = {
      chunk_type,
      payload: new DataView(
        midi_buffer,
        offset + CHUNK_HEADER_LENGTH,
        chunk_length
      ),
    };
    chunks.push(chunk);

    offset += CHUNK_HEADER_LENGTH + chunk_length;
  }

  return chunks;
}

/**
 * Parse the MIDI header from a chunk
 * @param {MIDIChunk} chunk The chunk for the header
 */
function parse_header(chunk) {
  if (chunk.chunk_type !== "MThd") {
    throw new Error(`Invalid header chunk type ${chunk.chunk_type}`);
  }

  const payload = chunk.payload;
  const format = payload.getUint16(0, BIG_ENDIAN);
  const num_tracks = payload.getUint16(4, BIG_ENDIAN);
  const ticks_per_quarter = payload.getUint16(8, BIG_ENDIAN);

  let format_enum;
  switch (format) {
    case 0:
      format_enum = MIDIFormat.SINGLE_TRACK;
      break;
    case 1:
      format_enum = MIDIFormat.MULTI_PARALLEL;
      break;
    case 2:
      format_enum = MIDIFormat.MULTI_SEQUENCE;
      break;
    default:
      throw new Error(`Invalid MIDI format ${format}`);
  }

  console.info("MIDI format", format, "detected");

  if (((ticks_per_quarter >> 7) & 1) !== 0) {
    throw new Error(
      "SMTPE time codes are not supported. Please try a different file"
    );
  }

  return new MIDIHeader(format_enum, num_tracks, ticks_per_quarter);
}

function parse_track(chunk) {
  if (chunk.chunk_type !== "MTrk") {
    throw new Error(`Invalid track chunk type ${chunk.chunk_type}`);
  }

  // iterate over the payload
  // - delta-time is a variable length quanity
  // - the event payload varies by message type
  //   - F0 or F7 are sysex messages
  //   - FF is a meta-event. Some are fixed-length, some are variable length

  return new MIDITrack([]);
}

/**
 * Parse a MIDI file
 * @param {ArrayBuffer} midi_buffer The MIDI file bytes as an ArrayBuffer
 */
export function parse_midi_file(midi_buffer) {
  const utf8 = new TextDecoder();

  const [header_chunk, ...track_chunks] = parse_midi_chunks(midi_buffer);
  const header = parse_header(header_chunk);
  const tracks = track_chunks.map((x) => parse_track(x));

  return new MIDIFile(header, tracks);
}
