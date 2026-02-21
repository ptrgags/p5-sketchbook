import { mod } from "../mod.js";

const PITCH_CLASS_LABELS = [
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

export class MIDIPitch {
  /**
   * Get the pitch class from a midi note
   * @param {number} midi_pitch The MIDI pitch number in [0, 127]
   * @returns {number} The pitch class in [0, 12)
   */
  static get_pitch_class(midi_pitch) {
    if (midi_pitch < 0 || midi_pitch > 127) {
      throw new Error("midi_pitch must be in [0, 127]");
    }
    return mod(midi_pitch, 12);
  }

  /**
   * Get the octave from a midi note
   * @param {number} midi_pitch The MIDI note number in [0, 127]
   * @returns {number} The octave number in [-1, 9]
   */
  static get_octave(midi_pitch) {
    if (midi_pitch < 0 || midi_pitch > 127) {
      throw new Error("midi_pitch must be in [0, 127]");
    }

    // Taking C4 = pitch 60, that means that midi note 0 corresponds to
    // C_1
    return Math.floor(midi_pitch / 12) - 1;
  }

  /**
   * Combine a pitch class and octave into a single MIDI note number
   * @param {number} pitch_class The pitch class from [0, 12)
   * @param {number} octave The octave number from [-1, 9]
   * @returns {number} The MIDI note number
   */
  static from_pitch_octave(pitch_class, octave) {
    const midi_pitch = (octave + 1) * 12 + pitch_class;

    if (midi_pitch < 0 || midi_pitch > 127) {
      throw new Error("pitch is out of MIDI range");
    }

    return midi_pitch;
  }

  /**
   * Format a pitch class as a string, like "C" or "F#"
   * @param {number} pitch_class Pitch class [0, 11]
   * @returns {string}
   */
  static format_pitch_class(pitch_class) {
    return PITCH_CLASS_LABELS[pitch_class];
  }

  /**
   * Format an absolute pitch, like "C4" or "F#5". Note that
   * sharps are always used, even if the key signature would
   * normally call for a flat
   * @param {number} midi_pitch MIDI pitch [0, 127]
   * @returns {string}
   */
  static format_pitch(midi_pitch) {
    const pitch_class = MIDIPitch.get_pitch_class(midi_pitch);
    const octave = MIDIPitch.get_octave(midi_pitch);

    const pitch_label = PITCH_CLASS_LABELS[pitch_class];
    return `${pitch_label}${octave}`;
  }
}
