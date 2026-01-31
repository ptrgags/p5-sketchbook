/**
 * Wrapper around a Tone.js Synth or PolySynth
 * @interface Instrument
 */
export class Instrument {
  /**
   * @param {number} value volume in dBFS
   */
  set volume(value) {
    throw new Error("not implemented");
  }

  /**
   * Allocate a monophonic synth
   * @param {import("tone")} tone The Tone.js library
   */
  init_mono(tone) {
    throw new Error("not implemented");
  }

  /**
   * Allocate a polyphonic synth
   * @param {import("tone")} tone The Tone.js library
   */
  init_poly(tone) {
    throw new Error("not implemented");
  }

  /**
   * Play a note
   * @param {string} pitch pitch in tone.js
   * @param {string} duration Duration as a Tone.js duration
   * @param {number} time Time as a Tone.js time
   * @param {number} velocity Velocity as a number in [0.0, 1.0]
   */
  play_note(pitch, duration, time, velocity) {
    throw new Error("not implemented");
  }

  /**
   * Clean up resources
   */
  destroy() {
    throw new Error("not implemented");
  }
}
