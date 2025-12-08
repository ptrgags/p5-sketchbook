import {
  get_data_length,
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  MIDIMessage,
  MIDIMetaEvent,
  MIDISysex,
  MIDITrack,
} from "./MidiFile.js";
import { decode_variable_length } from "./variable_length.js";

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

const META_MESSAGE = 0xff;
const SYSEX_MESSAGE = 0xf0;

/**
 * Parse a MIDI meta event
 * @param {DataView} track_payload The payload of the track chunk
 * @param {number} data_offset The offset of the byte after the FF status byte (in this case, the meta event type)
 * @param {number} tick_delta The time of the message
 * @returns {[import("./MidiFile.js").MIDIMetaEvent, number]} (message, next_offset)
 */
function parse_meta_message(track_payload, data_offset, tick_delta) {
  const meta_type = track_payload.getUint8(data_offset);
  const length = track_payload.getUint8(data_offset + 1);
  const body = new Uint8Array(
    track_payload.buffer,
    track_payload.byteOffset + data_offset + 2,
    length
  );
  const message = new MIDIMetaEvent(tick_delta, meta_type, body);
  return [message, data_offset + 2 + length];
}

/**
 * Parse a MIDI Sysex message (status byte 0xF0)
 * @param {DataView} track_payload The binary data of the track payload
 * @param {number} data_offset Index of the first data byte, which in this case is the length field.
 * @param {*} tick_delta The tick delta for the message
 * @returns {[MIDISysex, number]} (message, next_offset)
 */
function parse_sysex_message(track_payload, data_offset, tick_delta) {
  const [length, next_offset] = decode_variable_length(
    track_payload,
    data_offset
  );
  const data = new Uint8Array(
    track_payload.buffer,
    track_payload.byteOffset + next_offset,
    length
  );

  return [new MIDISysex(tick_delta, data), next_offset + length];
}

/**
 * Parse a MIDI message
 * @param {number} status_byte The status byte of the message
 * @param {DataView} track_payload the binary data of the track payload
 * @param {number} data_offset The first data byte (i.e. the byte after the status byte). For message types with no data fields, this is the byte after the status byte.
 * @param {number} tick_delta tick delta for this message
 * @returns {[MIDIMessage, number]} (message, next_offset)
 */
function parse_midi_message(
  status_byte,
  track_payload,
  data_offset,
  tick_delta
) {
  const message_type = status_byte >> 4;
  const channel = status_byte & 0xf;

  const data_length = get_data_length(message_type);
  const data = new Uint8Array(
    track_payload.buffer,
    track_payload.byteOffset + data_offset,
    data_length
  );

  return [
    new MIDIMessage(tick_delta, message_type, channel, data),
    data_offset + data_length,
  ];
}

/**
 * Parse a single MIDI message (minus time delta) from a track chunk. The
 * status byte is handled in parse_track due to managing running status
 * @param {number} status_byte Status byte parsed in parse_message
 * @param {DataView} track_payload Payload of the MIDI track chunk
 * @param {number} data_offset Offset of the first data byte. For messages that don't include data, this is the byte after the status byte.
 * @param {number} tick_delta The tick delta parsed in parse_track
 * @returns {[import("./MidiFile.js").MIDIEvent, number]} (message, after_offset). The parsed message along with the offset of the byte after the end of the message
 */
function parse_message(status_byte, track_payload, data_offset, tick_delta) {
  if (status_byte === META_MESSAGE) {
    return parse_meta_message(track_payload, data_offset, tick_delta);
  } else if (status_byte === SYSEX_MESSAGE) {
    return parse_sysex_message(track_payload, data_offset, tick_delta);
  }

  return parse_midi_message(
    status_byte,
    track_payload,
    data_offset,
    tick_delta
  );
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

    const [message, after_offset] = parse_message(
      running_status,
      payload,
      offset,
      tick_delta
    );
    offset = after_offset;
    events.push(message);
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
