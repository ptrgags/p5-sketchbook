import { ADSR } from "./ADSR.js";
import { Instrument } from "./Instrument.js";

/**
 * Simplified frequency modulation synth with 2 operators. It is always
 * a sine modulating a sine
 * @implements {Instrument}
 */
export class FMSynth {
  /**
   * Constructor
   * @param {number} cm_ratio Carrier:Modulator frequency ratio
   * @param {number} mod_index Ratio of modulator amplitude (frequency deviation) to modulator frequency
   * @param {ADSR} [envelope=ADSR.DEFAULT] The envelope for how to articulate the note
   * @param {ADSR} [mod_envelope=ADSR.DIGITAL] Modulation envelope
   */
  constructor(
    cm_ratio,
    mod_index,
    envelope = ADSR.DEFAULT,
    mod_envelope = ADSR.DIGITAL,
  ) {
    this.cm_ratio = cm_ratio;
    this.mod_index = mod_index;
    this.envelope = envelope;
    this.mod_envelope = mod_envelope;

    /**
     * @type {import("tone").FMSynth | import("tone").PolySynth}
     */
    this.synth = undefined;
  }

  /**
   * @type {number | undefined}
   */
  get volume() {
    return this.synth?.volume.value;
  }

  /**
   * @type {number}
   */
  set volume(value) {
    if (this.synth) {
      this.synth.volume.value = value;
    }
  }

  /**
   *
   * @param {import("tone")} tone
   */
  init_mono(tone) {
    this.synth = new tone.FMSynth({
      modulationIndex: this.mod_index,
      harmonicity: this.cm_ratio,
      oscillator: {
        type: "sine",
      },
      modulation: {
        type: "sine",
      },
      envelope: this.envelope,
      modulationEnvelope: this.mod_envelope,
    }).toDestination();
  }

  /**
   *
   * @param {import("tone")} tone
   */
  init_poly(tone) {
    this.synth = new tone.PolySynth(tone.FMSynth, {
      modulationIndex: this.mod_index,
      harmonicity: this.cm_ratio,
      oscillator: {
        type: "sine",
      },
      modulation: {
        type: "sine",
      },
      envelope: this.envelope,
      modulationEnvelope: this.mod_envelope,
    }).toDestination();
  }

  /**
   * Play a note
   * @param {string} pitch
   * @param {string} duration
   * @param {number} time
   * @param {number} velocity
   */
  play_note(pitch, duration, time, velocity) {
    this.synth.triggerAttackRelease(pitch, duration, time, velocity);
  }

  destroy() {
    if (this.synth) {
      this.synth.dispose();
    }
    throw new Error("Method not implemented.");
  }
}
