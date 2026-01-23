import { AbsTimelineOps } from "../music/AbsTimelineOps.js";
import { Score } from "../music/Score.js";
import { Rational } from "../Rational.js";
import { MIDIEvent, MIDIMessage } from "./MIDIEvent.js";
import { MIDIFile, MIDIHeader } from "./MIDIFile.js";
import { AbsoluteTimingTrack, RelativeTimingTrack } from "./MIDITrack.js";

/**
 * Format of MIDI file for exporting, as I have multiple use cases
 * @enum {number}
 */
export const MIDIExportFormat = {
  /**
   * Export score parts as separate tracks for use in a DAW. This skips
   * General MIDI program changes as this can lead to unexpected results
   */
  CLIPS: 0,
  /**
   * Export score to use with General MIDI instruments. this includes
   * Program Change events.
   */
  GENERAL_MIDI: 1,
};

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
 * @param {number} [midi_instrument] General MIDI instrument number
 * @returns {RelativeTimingTrack} The track, converted to use relative tick deltas as this is required by MIDI
 */
function make_track(channel, music, midi_instrument) {
  const abs_music = AbsTimelineOps.from_relative(music);
  /**
   * @type {[number, MIDIEvent][]}
   */
  const events = [...abs_music].flatMap((note) => {
    const note_on = MIDIMessage.note_on(channel, note.value.pitch);
    const note_off = MIDIMessage.note_off(channel, note.value.pitch);
    return [
      [to_ticks(note.start_time), note_on],
      [to_ticks(note.end_time), note_off],
    ];
  });

  if (midi_instrument === undefined) {
    return new AbsoluteTimingTrack(events).to_relative();
  }

  // We have a General MIDI instrument, so add a program change at the start
  const program_change = MIDIMessage.program_change(channel, midi_instrument);
  return new AbsoluteTimingTrack([
    [0, program_change],
    ...events,
  ]).to_relative();
}

/**
 * Convert a Score to a file of MIDI messages
 * @param {Score<number>} score Score in terms of midi notes
 * @param {MIDIExportFormat} format Select from one of the available formats
 * @return {MIDIFile<RelativeTimingTrack>} The converted MIDI file
 */
export function score_to_midi(score, format) {
  if (score.parts.length > 16) {
    throw new Error("scores with more than 16 parts not supported!");
  }

  const include_instrument = format === MIDIExportFormat.GENERAL_MIDI;

  // If there's only a single part, make a Format 0 MIDI File which contains
  // a single track
  if (score.parts.length === 1) {
    const header = MIDIHeader.DEFAULT_FORMAT0;
    const part = score.parts[0];
    // we only have one part, so put messages on channel 0
    const channel = 0;

    const midi_instrument = include_instrument
      ? part.midi_instrument
      : undefined;
    const track = make_track(channel, part.music, midi_instrument);
    return new MIDIFile(header, [track]);
  }

  // Otherwise, use Format 1 to split parts onto separate chacks
  const header = MIDIHeader.format1(score.parts.length);
  const tracks = score.parts.map((part) => {
    const midi_instrument = include_instrument
      ? part.midi_instrument
      : undefined;
    // Note: this does not currently support multiple parts on the same
    // MIDI channel
    return make_track(part.midi_channel, part.music, midi_instrument);
  });
  return new MIDIFile(header, tracks);
}
