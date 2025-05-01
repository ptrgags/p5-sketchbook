import { mod } from "../../../sketchlib/mod.js";

export class MidiPitch {
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
}
