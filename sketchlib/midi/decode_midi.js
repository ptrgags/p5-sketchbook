import {
  MIDIEvent,
  MIDIMessage,
  MIDIMetaEvent,
  MIDIMetaType,
  MIDISysex,
} from "./MIDIEvent.js";
import { MIDIFile, MIDIFormat, MIDIHeader } from "./MIDIFile.js";
import { RelativeTimingTrack } from "./MIDITrack.js";
import { decode_variable_length } from "./variable_length.js";

const SIZE_U32 = 4;

// 4 byte chunk magic + u32 length
const CHUNK_HEADER_LENGTH = 2 * SIZE_U32;

// this is for the littleEndian flag in DataView.getXXXX() functions
const BIG_ENDIAN = false;

const UTF8 = new TextDecoder("utf-8");

/**
 * Raw MIDI chunk
 * @typedef {{chunk_type: string, payload: DataView}} MIDIChunk
 */

/**
 *
 * @param {ArrayBuffer} midi_buffer
 * @returns {MIDIChunk[]}
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
 *
 * @param {MIDIChunk} chunk
 * @returns {MIDIHeader}
 */
function parse_midi_header(chunk) {
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
 *
 * @param {number} status_byte Running status byte
 * @param {DataView} track_payload
 * @param {number} data_offset
 * @returns {[MIDIEvent, number]}
 */
function parse_midi_message(status_byte, track_payload, data_offset) {
  if (status_byte === MIDIMetaEvent.MAGIC) {
    return MIDIMetaEvent.decode(track_payload, data_offset);
  } else if (status_byte === MIDISysex.MAGIC) {
    return MIDISysex.decode(track_payload, data_offset);
  }

  return MIDIMessage.decode(status_byte, track_payload, data_offset);
}

/**
 *
 * @param {MIDIChunk} chunk
 * @returns {RelativeTimingTrack}
 */
function parse_midi_track(chunk) {
  if (chunk.chunk_type !== "MTrk") {
    throw new Error(`Invalid track chunk type ${chunk.chunk_type}`);
  }

  /**
   * @type {[number, MIDIEvent][]}
   */
  const events = [];
  const payload = chunk.payload;
  let offset = 0;
  let running_status = undefined;
  while (offset < payload.byteLength) {
    const [tick_delta, next_offset] = decode_variable_length(payload, offset);
    offset = next_offset;

    // Take a look at the next byte to determine how to parse it
    const status_byte = payload.getUint8(offset);

    // All the status bytes have the highest bit sets. Data bytes
    // are always 7-bit so the highest bit is 0
    const is_status_byte = status_byte >> 7 == 1;

    if (!is_status_byte && running_status === undefined) {
      throw new Error(
        "Invalid MIDI message: first message does not have a status byte"
      );
    }

    if (is_status_byte) {
      // Explicit status byte, so update the running status
      running_status = status_byte;
      // Increment the offset so we're pointing to the first data byte
      offset++;
    } else {
      // running status, the status byte is the same as the previous
      // status byte in the file. nothing to be done
    }

    const [message, after_offset] = parse_midi_message(
      running_status,
      payload,
      offset
    );
    offset = after_offset;

    // My implementation treats end of track messages as implicit, so
    // filter it out here
    if (
      message instanceof MIDIMetaEvent &&
      message.meta_type === MIDIMetaType.END_OF_TRACK
    ) {
      continue;
    }
    events.push([tick_delta, message]);
  }

  return new RelativeTimingTrack(events);
}

/**
 * Decode a MIDIFile from binary data
 * @param {ArrayBuffer} midi_buffer
 * @return {MIDIFile}
 */
export function decode_midi(midi_buffer) {
  const [header_chunk, ...track_chunks] = parse_midi_chunks(midi_buffer);
  const header = parse_midi_header(header_chunk);
  const tracks = track_chunks.map(parse_midi_track);
  return new MIDIFile(header, tracks);
}
