/**
 * @enum {string}
 */
export const BasicWaveform = {
  SINE: "sine",
  TRIANGLE: "triangle",
  SAW: "sawtooth",
  SQUARE: "square",
};

/**
 * @typedef {{
 * attack: number,
 * decay: number,
 * sustain: number,
 * release: number
 * }} ADSR
 */

export class BasicSynth {
  /**
   *
   * @param {"sine" | "sawtooth" | "triangle" | "square"} waveform
   * @param {ADSR} envelope
   * @param {number} initial_volume Initial volume of synth in DB
   */
  constructor(waveform, envelope, initial_volume) {
    this.waveform = waveform;
    this.envelope = envelope;
    this.initial_volume = initial_volume;
    /**
     * @type {import("tone").Synth}
     */
    this.synth = undefined;
  }

  /**
   * Create Tone.js resources
   * @param {import("tone")} tone Tone library
   */
  init(tone) {
    this.synth = new tone.Synth({
      oscillator: {
        type: this.waveform,
      },
      envelope: this.envelope,
    }).toDestination();
    this.synth.volume.value = this.initial_volume;
  }

  /**
   * Destroy the synth
   */
  destroy() {
    if (this.synth) {
      this.synth.dispose();
    }
  }

  play_note(pitch, duration, velocity, time) {
    if (!this.synth) {
      throw new Error(
        "Synth hasn't been initialized! did you forget to call init()?"
      );
    }

    this.synth.triggerAttackRelease(pitch, duration, time, velocity);
  }
}

export class FMSynth {
  constructor(cm_ratio, depth, envelope, mod_envelope) {
    this.cm_ratio = cm_ratio;
    this.depth = depth;
    this.envelope = this.envelope;
    this.mod_envelope = this.mod_envelope;
  }

  /**
   * Create Tone.js resources
   * @param {import("tone")} tone Tone library
   */
  init(tone) {
    this.synth = new tone.FMSynth({
      harmonicity: this.cm_ratio,
      modulationIndex: this.depth,
      oscillator: {
        type: "sine",
      },
      modulation: {
        type: "sine",
      },
      modulationEnvelope: this.mod_envelope,
      envelope: this.envelope,
    });
  }
}

export class DetunedSynth {
    constructor()
}
