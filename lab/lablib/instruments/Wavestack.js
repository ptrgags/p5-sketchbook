import { ADSR } from "./ADSR.js";
import { Instrument } from "./Instrument.js";

/**
 * Stack of detuned waves, like Supersaw, but any basic
 * @implements {Instrument}
 */
export class WaveStack {
  /**
   * Constructor
   * @param {"sine" | "triangle" | "square" | "sawtooth"} waveform The waveform for this synth
   * @param {number} count How many copies of the oscillator
   * @param {number} spread How many cents apart are the oscillators
   * @param {ADSR} [envelope=ADSR.DEFAULT] The envelope for how to articulate the note
   */
  constructor(waveform, count, spread, envelope = ADSR.DEFAULT) {
    this.count = count;
    this.spread = spread;
    /**
     * @type {"fatsine" | "fattriangle" | "fatsquare" | "fatsawtooth"}
     */
    this.waveform = `fat${waveform}`;
    this.envelope = envelope;

    /**
     * @type {import("tone").Synth | import("tone").PolySynth}
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
    this.synth = new tone.Synth({
      oscillator: {
        type: this.waveform,
        count: this.count,
        spread: this.spread,
      },
      envelope: this.envelope,
    }).toDestination();
  }

  /**
   *
   * @param {import("tone")} tone
   */
  init_poly(tone) {
    this.synth = new tone.PolySynth(tone.Synth, {
      oscillator: {
        type: this.waveform,
        count: this.count,
        spread: this.spread,
      },
      envelope: this.envelope,
    }).toDestination();
  }

  destroy() {
    if (this.synth) {
      this.synth.dispose();
    }
    throw new Error("Method not implemented.");
  }
}
