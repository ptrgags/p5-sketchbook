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
   * @param {string} pitch The pitch in ToneJS format
   * @param {string} duration The duration in ToneJS format
   * @param {number} time Tonejs time
   */
  play_note(pitch, duration, time) {
    throw new Error("not implemented");
  }

  /**
   * Release all notes
   */
  release_all() {
    throw new Error("not implemented");
  }

  /**
   * Clean up resources
   */
  destroy() {
    throw new Error("not implemented");
  }
}
