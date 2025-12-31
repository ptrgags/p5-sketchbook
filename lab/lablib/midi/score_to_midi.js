import { Score } from "../music/Score.js";
import { to_events } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import {
  AbsoluteTimingTrack,
  DEFAULT_TICKS_PER_QUARTER,
  MIDIEvent,
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  MIDIMessage,
  RelativeTimingTrack,
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
 * Gather the note on/off events into a track
 * @param {Score<number>} score
 * @returns {AbsoluteTimingTrack} Events sorted by absolute time
 */
function gather_note_events(score) {
  /**
   * @type {[number, MIDIEvent][]}
   */
  const all_events = [];
  for (const [channel, [, music]] of score.parts.entries()) {
    /**
     * @type {[number, MIDIEvent][]}
     */
    const part_events = to_events(Rational.ZERO, music).flatMap(
      ([note, start, end]) => {
        const note_on = MIDIMessage.note_on(channel, note.pitch);
        const note_off = MIDIMessage.note_off(channel, note.pitch);
        return [
          [to_ticks(start), note_on],
          [to_ticks(end), note_off],
        ];
      }
    );

    all_events.push(...part_events);
  }

  const sorted = all_events.sort(([t_a], [t_b]) => t_a - t_b);
  return new AbsoluteTimingTrack(sorted);
}

/**
 * Convert a Score to a file of MIDI messages
 * @param {Score<number>} score Score in terms of midi notes
 * @return {MIDIFile<RelativeTimingTrack>} The converted MIDI file
 */
export function score_to_midi(score) {
  if (score.parts.length > 16) {
    throw new Error("scores with more than 16 parts not supported!");
  }

  const header = new MIDIHeader(
    MIDIFormat.SINGLE_TRACK,
    1,
    DEFAULT_TICKS_PER_QUARTER
  );

  const absolute_track = gather_note_events(score);
  const relative_track = absolute_track.to_relative();

  return new MIDIFile(header, [relative_track]);
}
