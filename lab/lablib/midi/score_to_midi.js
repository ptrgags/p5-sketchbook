import { Score } from "../music/Score.js";
import { to_events } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import { MIDIEvent, MIDIMessage } from "./MIDIEvent.js";
import { MIDIFile, MIDIHeader } from "./MIDIFile.js";
import { AbsoluteTimingTrack, RelativeTimingTrack } from "./MIDITrack.js";

// Assuming 4/4 time
const TICKS_PER_MEASURE = 4 * MIDIHeader.DEFAULT_TICKS_PER_QUARTER;

/**
 * Get the number of ticks
 * @param {Rational} time_measures How many measures since the start of the score as a fraction
 * @returns {number} integer number of MIDI ticks
 */
function to_ticks(time_measures) {
  return Math.round(time_measures.real * TICKS_PER_MEASURE);
}

/**
 * Make a MIDI track from a single part from the score
 * @param {number} channel MIDI channel number, in [0, 15]
 * @param {import("../music/Music.js").Music<number>} music The music to write
 * @returns {RelativeTimingTrack} The track, converted to use relative tick deltas as this is required by MIDI
 */
function make_track(channel, music) {
  /**
   * @type {[number, MIDIEvent][]}
   */
  const events = to_events(Rational.ZERO, music).flatMap(
    ([note, start, end]) => {
      const note_on = MIDIMessage.note_on(channel, note.pitch);
      const note_off = MIDIMessage.note_off(channel, note.pitch);
      return [
        [to_ticks(start), note_on],
        [to_ticks(end), note_off],
      ];
    }
  );

  const absolute_track = new AbsoluteTimingTrack(events);
  return absolute_track.to_relative();
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

  // If there's only a single part, make a Format 0 MIDI File which contains
  // a single track
  if (score.parts.length === 1) {
    const header = MIDIHeader.DEFAULT_FORMAT0;
    const channel = 0;
    const [, music] = score.parts[channel];
    const track = make_track(channel, music);
    return new MIDIFile(header, [track]);
  }

  // Otherwise, use Format 1 to split parts onto separate chacks
  const header = MIDIHeader.format1(score.parts.length);
  const tracks = score.parts.map((x, channel) => {
    const [, music] = x;
    return make_track(channel, music);
  });
  return new MIDIFile(header, tracks);
}
