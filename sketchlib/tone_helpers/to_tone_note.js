import { Note } from "../music/Music.js";
import { to_tone_pitch } from "./to_tone_pitch.js";

/**
 * Convert a Note storing a MIDI value
 * @param {Note<number>} note A note where the value is a MIDI note number
 * @returns {[string, number]} Tone.js-style (pitch, velocity) pair
 */
export function to_tone_note(note) {
  const pitch = to_tone_pitch(note.pitch);
  const velocity = note.velocity / 127;
  return [pitch, velocity];
}
