import { Score } from "../music/Score.js";
import { to_events } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import {
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  MIDIMessage,
  MIDIMessageType,
  MIDITrack,
} from "./MidiFile";

// Ableton's export format
const TICKS_PER_QUARTER = 96;
// Assuming 4/4 time
const TICKS_PER_MEASURE = TICKS_PER_QUARTER / 4;
const DEFAULT_VELOCITY = 127;

/**
 *
 * @param {MIDIFile} midi
 * @return {ArrayBuffer[]} The header and track chunk(s) for the MIDI files
 */
function encode_midi(midi) {
  return [];
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
