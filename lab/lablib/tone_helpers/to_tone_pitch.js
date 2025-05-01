import { MidiPitch } from "../music/pitch_conversions.js";

const PITCH_CLASSES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

/**
 * Convert a MIDI pitch to a tone pitch
 * @param {number} midi_pitch The MIDI pitch number
 * @returns
 */
export function to_tone_pitch(midi_pitch) {
  const octave = MidiPitch.get_octave(midi_pitch);
  const pitch_class = MidiPitch.get_pitch_class(midi_pitch);

  const pitch_letter = PITCH_CLASSES[pitch_class];
  return `${pitch_letter}${octave}`;
}
