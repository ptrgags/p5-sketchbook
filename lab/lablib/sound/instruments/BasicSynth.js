import { ADSR } from "../ADSR.js";
import { Instrument } from "../Instrument.js";

/**
 * @implements {Instrument}
 */
export class BasicSynth {
  /**
   * Constructor
   * @param {"sine" | "triangle" | "square" | "sawtooth"} waveform One of the basic waveforms
   * @param {ADSR} [envelope=ADSR.DEFAULT] Amp envelope for the synth
   */
  constructor(waveform, envelope = ADSR.DEFAULT) {
    this.waveform = waveform;
    this.envelope = envelope;

    /**
     * Synth. Allocated in init_synth() and deallocated in
     * @type {import("tone").Synth | import("tone").PolySynth}
     */
    this.synth = undefined;
  }

  /**
   * Initialize a monophonic synth
   * @param {import("tone")} tone
   */
  init_mono_synth(tone) {
    if (this.synth) {
      return;
    }

    this.synth = new tone.Synth({
      oscillator: {
        type: this.waveform,
      },
      envelope: this.envelope,
    }).toDestination();
  }

  /**
   * Initialize a monophonic synth
   * @param {import("tone")} tone
   */
  init_poly_synth(tone) {
    if (this.synth) {
      return;
    }

    this.synth = new tone.PolySynth(tone.Synth, {
      oscillator: {
        type: this.waveform,
      },
      envelope: this.envelope,
    }).toDestination();
  }

  destroy_synth() {
    if (!this.synth) {
      return;
    }

    this.synth.dispose();
    this.synth = undefined;
  }
}
