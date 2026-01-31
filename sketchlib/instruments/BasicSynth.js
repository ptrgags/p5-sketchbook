import { ADSR } from "./ADSR.js";
import { Instrument } from "./Instrument.js";

/**
 * Synth for one of the basic instruments
 * @implements {Instrument}
 */
export class BasicSynth {
  /**
   * Constructor
   * @param {"sine" | "triangle" | "square" | "sawtooth"} waveform The waveform for this synth
   * @param {ADSR} [envelope=ADSR.DEFAULT] The envelope for how to articulate the note
   */
  constructor(waveform, envelope = ADSR.DEFAULT) {
    this.waveform = waveform;
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

  init_mono(tone) {
    this.synth = new tone.Synth({
      oscillator: {
        type: this.waveform,
      },
      envelope: this.envelope,
    }).toDestination();
  }

  init_poly(tone) {
    this.synth = new tone.PolySynth(tone.Synth, {
      oscillator: {
        type: this.waveform,
      },
      envelope: this.envelope,
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
  }
}
