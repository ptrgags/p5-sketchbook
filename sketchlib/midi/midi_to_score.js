import { Score } from "../music/Score.js";
import { MIDIFile, MIDIFormat } from "./MIDIFile.js";
import { RelativeTimingTrack } from "./MIDITrack.js";
import { ScoreBuilder } from "./ScoreBuilder.js";

/**
 * Take a MIDI file and convert it to a Score representation. For this
 * first iteration, it only examines note events and logs anything else
 * to the console.
 *
 * @param {MIDIFile<RelativeTimingTrack>} midi Decoded MIDI file
 * @returns {Score<number>}
 */
export function midi_to_score(midi) {
  const builder = new ScoreBuilder(midi.header.ticks_per_quarter);

  if (midi.header.format !== MIDIFormat.SINGLE_TRACK) {
    throw new Error(
      `not implemented: midi_to_score for Format ${midi.header.format} MIDI file`,
    );
  }

  const abs_track = midi.tracks[0].to_absolute();
  for (const [time, message] of abs_track.events) {
    builder.process_event(time, message);
  }

  return builder.build();
}
