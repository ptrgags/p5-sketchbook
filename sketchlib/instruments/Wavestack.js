import { ADSR } from "./ADSR.js";
import { Instrument, Polyphony } from "./Instrument.js";

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
   * Initialize the synth
   * @param {import("tone")} tone Tone library
   * @param {Polyphony} polyphony Whether to create a mono or polyphonic synth
   * @param {import("tone").InputNode} destination Audio node to connect to
   */
  init(tone, polyphony, destination) {
    const options = {
      oscillator: {
        type: this.waveform,
        count: this.count,
        spread: this.spread,
      },
      envelope: this.envelope,
    };

    this.synth =
      polyphony === Polyphony.POLYPHONIC
        ? new tone.PolySynth(tone.Synth, options)
        : new tone.Synth(options);
    this.synth.connect(destination);
  }

  /**
   * Play a note
   * @param {string} pitch The pitch in ToneJS format
   * @param {string} duration The duration in ToneJS format
   * @param {number} time Tonejs time
   */
  play_note(pitch, duration, time) {
    if (!this.synth) {
      throw new Error("can't play note before init()");
    }

    this.synth.triggerAttackRelease(pitch, duration, time);
  }

  release_all() {
    if (!this.synth) {
      return;
    }

    // @ts-ignore
    if (this.synth.releaseAll) {
      //@ts-ignore
      this.synth.releaseAll();
    } else if (this.synth) {
      //@ts-ignore
      this.synth.triggerRelease();
    }
  }

  destroy() {
    if (this.synth) {
      this.synth.dispose();
      this.synth = undefined;
    }
  }
}
