/**
 * Wrapper around a Tone.js Synth or PolySynth
 * @interface Instrument
 */
export class Instrument {
  /**
   * @param number
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
   * Clean up resources
   */
  destroy() {
    throw new Error("not implemented");
  }
}
