import { Score } from "../music/Score.js";
import { to_events } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import {
  DEFAULT_TICKS_PER_QUARTER,
  DEFAULT_VELOCITY,
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  MIDIMessage,
  MIDIMessageType,
  MIDIMetaEvent,
  MIDIMetaType,
  MIDITrack,
} from "./MidiFile.js";

// Assuming 4/4 time
const TICKS_PER_MEASURE = 4 * DEFAULT_TICKS_PER_QUARTER;

/**
 * Get the number of ticks
 * @param {Rational} time_measures How many measures since the start of the score as a fraction
 * @returns {number} integer number of MIDI ticks
 */
function to_ticks(time_measures) {
  return Math.round(time_measures.real * TICKS_PER_MEASURE);
}

/**
 * Convert a Score to a file of MIDI messages
 * @param {Score<number>} score Score in terms of midi notes
 * @return {MIDIFile} The converted MIDI file
 */
export function score_to_midi(score) {
  const header = new MIDIHeader(
    MIDIFormat.SINGLE_TRACK,
    1,
    DEFAULT_TICKS_PER_QUARTER
  );

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
  return new MIDIFile(header, [track]);
}
