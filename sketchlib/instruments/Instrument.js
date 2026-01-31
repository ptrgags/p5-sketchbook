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
   * Allocate Tone.js resources for this instrument
   * @param {import('tone')} tone Tone module
   * @param {import('tone').InputNode} destination Destination to connect to
   * @param {number} voices Number of voices to allocate
   */
  init(tone, destination, voices) {
    throw new Error("Method not implemented.");
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
