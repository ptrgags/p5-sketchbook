import { Score } from "../music/Score.js";
import { to_events } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import {
  get_data_length,
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  MIDIMessage,
  MIDIMessageType,
  MIDIMetaEvent,
  MIDIMetaType,
  MIDISysex,
  MIDITrack,
} from "./MidiFile.js";
import { encode_variable_length } from "./variable_length.js";

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

const MESSAGE_HEADER_LENGTH = 1;
const META_HEADER_LENGTH = 3;
const SYSEX_HEADER_LENGTH = 2;

/**
 *
 * @param {import("./MidiFile").MIDIEvent[]} events The events to encode
 * @returns
 */
function compute_track_chunk_length(events) {
  let payload_size = 0;
  for (const event of events) {
    if (event instanceof MIDIMessage) {
      const tick_length = compute_variable_length(event.tick_delta);
      const data_length = get_data_length(event.message_type);
      payload_size += tick_length + MESSAGE_HEADER_LENGTH + data_length;
    } else if (event instanceof MIDIMetaEvent) {
      const tick_length = compute_variable_length(event.tick_delta);
      const data_length = event.payload.length;
      payload_size += tick_length + META_HEADER_LENGTH + data_length;
    } else if (event instanceof MIDISysex) {
      const tick_length = compute_variable_length(event.tick_delta);
      const data_length = event.data.length;
      payload_size += tick_length + SYSEX_HEADER_LENGTH + data_length;
    }
  }

  return CHUNK_HEADER_LENGTH + payload_size;
}

const META_MESSAGE = 0xff;

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
    if (event instanceof MIDIMessage) {
      offset = encode_variable_length(data_view, offset, event.tick_delta);
      const status = (event.message_type << 4) | event.channel;
      data_view.setUint8(offset, status);

      for (let i = 0; i < event.data.length; i++) {
        data_view.setUint8(offset + 1 + i, event.data[i]);
      }
      offset += event.data.length + 1;
    }

    if (event instanceof MIDIMetaEvent) {
      offset = encode_variable_length(data_view, offset, event.tick_delta);
      data_view.setUint8(offset, META_MESSAGE);
      data_view.setUint8(offset + 1, event.meta_type);
      data_view.setUint8(offset + 2, event.payload.length);
      for (let i = 0; i < event.payload.length; i++) {
        data_view.setUint8(offset + 3 + i, event.payload[i]);
      }
      offset += 3 + event.payload.length;
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
    const event = new MIDIMessage(
      delta,
      message_type,
      channel,
      new Uint8Array([pitch, DEFAULT_VELOCITY])
    );
    events.push(event);

    prev_tick = absolute_tick;
  }

  // the End of Track message is required
  events.push(
    new MIDIMetaEvent(0, MIDIMetaType.END_OF_TRACK, new Uint8Array(0))
  );

  const track = new MIDITrack(events);
  const midi = new MIDIFile(header, [track]);

  const chunks = encode_midi(midi);
  return new File(chunks, `${score_id}.mid`, { type: "audio/mid" });
}
