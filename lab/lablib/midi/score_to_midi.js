import { Score } from "../music/Score.js";
import { to_events } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import {
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  MIDIMessageType,
  MIDINote,
  MIDITrack,
} from "./MidiFile.js";

// Ableton's export format
const TICKS_PER_QUARTER = 96;
// Assuming 4/4 time
const TICKS_PER_MEASURE = TICKS_PER_QUARTER / 4;
const DEFAULT_VELOCITY = 127;

// "MThd" + length + 3 u16 fields
const CHUNK_HEADER_LENGTH = 8;
const HEADER_PAYLOAD_LENGTH = 6;
const HEADER_CHUNK_LENGTH = CHUNK_HEADER_LENGTH + HEADER_PAYLOAD_LENGTH;

const UTF8 = new TextEncoder();

const HEADER_MAGIC = UTF8.encode("MThd");
const TRACK_MAGIC = UTF8.encode("MTrk");

// for big endian, set littleEndian = false
const BIG_ENDIAN = false;

/**
 * Encode the MIDI header as a chunk of bytes
 * @param {MIDIHeader} header The header for the MIDI file
 * @return {ArrayBuffer} a buffer for the header chunk
 */
function encode_header(header) {
  const buffer = new ArrayBuffer(HEADER_CHUNK_LENGTH);

  const data_view = new DataView(buffer);

  // Write the magic string for a header chunk
  const u8_view = new Uint8Array(buffer);
  u8_view.set(HEADER_MAGIC);
  data_view.setUint32(4, HEADER_PAYLOAD_LENGTH, BIG_ENDIAN);

  data_view.setUint16(8, header.format, BIG_ENDIAN);
  data_view.setUint16(10, header.num_tracks, BIG_ENDIAN);
  data_view.setUint16(12, header.ticks_per_quarter, BIG_ENDIAN);

  return buffer;
}

function compute_variable_length(x) {
  if (x === 0) {
    return 1;
  }

  let current = x;
  let bytes = 0;
  while (current !== 0) {
    bytes++;
    current >>= 7;
  }

  return bytes;
}

// status + 2 data bytes
const NOTE_EVENT_LENGTH = 3;

/**
 *
 * @param {import("./MidiFile").MIDIEvent[]} events The events to encode
 * @returns
 */
function compute_track_chunk_length(events) {
  let payload_size = 0;
  for (const event of events) {
    if (event instanceof MIDINote) {
      payload_size += compute_variable_length(event.tick_delta);
      payload_size += NOTE_EVENT_LENGTH;
    }
  }

  return CHUNK_HEADER_LENGTH + payload_size;
}

/**
 * Split a value into 7-bit chunks
 * @param {number} value The value to split
 * @returns {number[]} the 7-bit values in LSBF order
 */
function split_value_7bits(value) {
  if (value === 0) {
    return [0];
  }

  const values = [];
  let current = value;
  while (current !== 0) {
    values.push(current & 0x7f);
    current >>= 7;
  }
  return values;
}

/**
 * Write a variable-length quantity as described in the MIDI spec
 * @param {DataView} data_view The buffer to write to
 * @param {number} offset The offset of the first byte to write
 * @param {number} value value to encode
 * @returns {number} the new offset after writing the variable-length quantity
 */
function encode_variable_length(data_view, offset, value) {
  const values_lsbf = split_value_7bits(value);
  const values_msbf = values_lsbf.reverse();

  // For all bytes except the last one, the MIDI spec says to
  // set the high bit (to indicate more bytes following)
  for (let i = 0; i < values_msbf.length - 1; i++) {
    const high_bit_set = (1 << 7) | values_msbf[i];
    data_view.setUint8(offset + i, high_bit_set);
  }
  // For the last byte, the value is written verbatim
  const last_index = values_msbf.length - 1;
  data_view.setUint8(offset + last_index, values_msbf[last_index]);

  return offset + values_msbf.length;
}

/**
 * Encode a track
 * @param {MIDITrack} track The track to encode
 * @return {ArrayBuffer} A buffer containing a track chunk
 */
function encode_track(track) {
  const length = compute_track_chunk_length(track.events);
  const buffer = new ArrayBuffer(length);

  const data_view = new DataView(buffer);
  const u8_view = new Uint8Array(buffer);
  u8_view.set(TRACK_MAGIC);
  data_view.setUint32(4, HEADER_PAYLOAD_LENGTH, BIG_ENDIAN);

  let offset = CHUNK_HEADER_LENGTH;
  for (const event of track.events) {
    if (event instanceof MIDINote) {
      offset = encode_variable_length(data_view, offset, event.tick_delta);

      const status = (event.message_type << 4) | event.channel;
      data_view.setUint8(offset, status);
      data_view.setUint8(offset + 1, event.pitch);
      data_view.setUint8(offset + 2, event.velocity);
      offset += NOTE_EVENT_LENGTH;
    }
  }

  return buffer;
}

/**
 * Encode a MIDI file to a sequence of ArrayBuffers for use with File
 * @param {MIDIFile} midi
 * @return {ArrayBuffer[]} The header and track chunk(s) for the MIDI files
 */
function encode_midi(midi) {
  const header_chunk = encode_header(midi.header);
  const track_chunks = midi.tracks.map(encode_track);

  return [header_chunk, ...track_chunks];
}

/**
 * Get the number of ticks
 * @param {Rational} time_measures How many measures since the start of the score as a fraction
 * @returns {number} integer number of MIDI ticks
 */
function to_ticks(time_measures) {
  return Math.round(time_measures.real * TICKS_PER_MEASURE);
}

/**
 *
 * @param {Score<number>} score Score in terms of midi notes
 */
export function score_to_midi(score, score_id) {
  const header = new MIDIHeader(MIDIFormat.SINGLE_TRACK, 1, TICKS_PER_QUARTER);

  /**
   * @type {[number, number, MIDIMessageType, number][]}
   */
  const all_events = [];
  for (const [i, [, music]] of score.parts.entries()) {
    const part_events = to_events(Rational.ZERO, music).flatMap(
      ([note, start, end]) => {
        /**
         * @type {[number, number, MIDIMessageType, number]}
         */
        const start_event = [
          to_ticks(start),
          i,
          MIDIMessageType.NOTE_ON,
          note.pitch,
        ];
        /**
         * @type {[number, number, MIDIMessageType, number]}
         */
        const end_event = [
          to_ticks(end),
          i,
          MIDIMessageType.NOTE_OFF,
          note.pitch,
        ];
        return [start_event, end_event];
      }
    );
    all_events.push(...part_events);
  }

  const sorted = all_events.sort((a, b) => a[0] - b[0]);

  const events = [];
  let prev_tick = 0;
  for (const [absolute_tick, channel, message_type, pitch] of sorted) {
    const delta = absolute_tick - prev_tick;
    const event = new MIDINote(
      delta,
      channel,
      message_type,
      pitch,
      DEFAULT_VELOCITY
    );
    events.push(event);

    prev_tick = absolute_tick;
  }

  const track = new MIDITrack(events);
  const midi = new MIDIFile(header, [track]);

  const chunks = encode_midi(midi);
  return new File(chunks, `${score_id}.mid`, { type: "audio/mid" });
}
