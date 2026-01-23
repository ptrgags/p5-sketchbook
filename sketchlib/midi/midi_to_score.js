import { Score } from "../music/Score.js";
import { MIDIFile } from "./MIDIFile.js";
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
  const builder = new ScoreBuilder();

  // Process the messages

  return builder.build();
}
