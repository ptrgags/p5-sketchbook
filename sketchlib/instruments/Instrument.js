/**
 * Whether the instrument is monophonic or polyphonic
 * @enum {number}
 */
export const Polyphony = {
  MONOPHONIC: 0,
  POLYPHONIC: 1,
};
Object.freeze(Polyphony);

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
   * Allocate a synth
   * @param {import("tone")} tone The Tone.js library
   * @param {Polyphony} polyphony Whether the synth is mono or polyphonic
   * @param {import("tone").InputNode} destination Destination node to connect to
   */
  init(tone, polyphony, destination) {
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
