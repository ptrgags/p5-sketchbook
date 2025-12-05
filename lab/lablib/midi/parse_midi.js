import {
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  MIDIMessageType,
  MIDINote,
  MIDITrack,
} from "./MidiFile.js";

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
  const num_tracks = payload.getUint16(2, BIG_ENDIAN);
  const ticks_per_quarter = payload.getUint16(4, BIG_ENDIAN);

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

/**
 * Parse one of the regular MIDI message types
 * @param {DataView} payload The binary data for the track chunk
 * @param {number} offset The first byte of the variable length quantity
 * @returns {[number, number]} (value, next_offset)
 */
function parse_variable_length(payload, offset) {
  let index = offset;
  let more_bytes = true;
  let value = 0;
  while (more_bytes) {
    const byte = payload.getUint8(index);
    // the low 7 bits are tacked on to the value (MSBF)
    value = (value << 7) | (byte & 0x7f);

    // the top bit of the byte indicates that there's more bytes to come.
    more_bytes = byte >> 7 === 1;
    index++;
  }

  return [value, index];
}

const META_MESSAGE = 0xff;
const SYSEX_MESSAGE = 0xf0;
const SYSEX_ESCAPE = 0xf7;

function parse_meta_message(payload) {
  throw new Error("Not yet implemented!");
}

function parse_sysex_message(payload) {
  throw new Error("Not yet implemented!");
}

/**
 * Parse a MIDI message
 * @param {DataView} payload the binary data of the track payload
 * @param {number} offset the start offset for the body of this message (after the tick delta)
 * @param {number} tick_delta tick delta for this message
 * @returns {[import("./MidiFile.js").MIDIEvent, number]} (message, next_offset)
 */
function parse_midi_message(payload, offset, tick_delta) {
  const status = payload.getUint8(offset);
  const message_type = status >> 4;
  const channel = status & 0xf;

  if (
    message_type === MIDIMessageType.NOTE_ON ||
    message_type === MIDIMessageType.NOTE_OFF
  ) {
    const pitch = payload.getUint8(offset + 1);
    const velocity = payload.getUint8(offset + 2);
    const note = new MIDINote(
      tick_delta,
      channel,
      message_type,
      pitch,
      velocity
    );
    return [note, offset + 3];
  }

  throw new Error(`not yet implemented: message type ${message_type}`);
}

/**
 * Parse a MIDI track
 * @param {MIDIChunk} chunk
 * @returns {MIDITrack} The parsed track
 */
function parse_track(chunk) {
  if (chunk.chunk_type !== "MTrk") {
    throw new Error(`Invalid track chunk type ${chunk.chunk_type}`);
  }

  const events = [];
  const payload = chunk.payload;
  let offset = 0;
  while (offset < payload.byteLength) {
    const [tick_delta, next_offset] = parse_variable_length(payload, offset);
    offset = next_offset;

    // Take a look at the next byte to determine how to parse it
    const peek = payload.getUint8(offset);
    if (peek === META_MESSAGE) {
      parse_meta_message(payload);
    } else if (peek === SYSEX_MESSAGE || peek === SYSEX_ESCAPE) {
      parse_sysex_message(payload);
    } else {
      const [message, next_offset] = parse_midi_message(
        payload,
        offset,
        tick_delta
      );
      offset = next_offset;
      events.push(message);
    }
  }

  return new MIDITrack(events);
}

/**
 * Parse a MIDI file
 * @param {ArrayBuffer} midi_buffer The MIDI file bytes as an ArrayBuffer
 */
export function parse_midi_file(midi_buffer) {
  const [header_chunk, ...track_chunks] = parse_midi_chunks(midi_buffer);
  const header = parse_header(header_chunk);
  const tracks = track_chunks.map((x) => parse_track(x));

  return new MIDIFile(header, tracks);
}
