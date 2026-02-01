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
   * Allocate Tone.js resources for this instrument
   * @param {import('tone')} tone Tone module
   * @param {import('tone').InputNode} destination Destination to connect to
   * @param {number} voices Number of voices to allocate
   */
  init(tone, destination, voices) {
    const options = {
      oscillator: {
        type: this.waveform,
        count: this.count,
        spread: this.spread,
      },
      envelope: this.envelope,
    };

    if (voices > 1) {
      this.synth = new tone.PolySynth({
        options,
        voice: tone.Synth,
        maxPolyphony: 32,
      }).toDestination();
    } else {
      this.synth = new tone.Synth(options);
    }

    this.synth.connect(destination);
  }

  /**
   * Play a note
   * @param {string} pitch pitch in tone.js
   * @param {string} duration Duration as a Tone.js duration
   * @param {number} time Time as a Tone.js time
   * @param {number} velocity Velocity as a number in [0.0, 1.0]
   */
  play_note(pitch, duration, time, velocity) {
    if (!this.synth) {
      throw new Error("play_note before initialization");
    }

    this.synth.triggerAttackRelease(pitch, duration, time, velocity);
  }

  destroy() {
    if (this.synth) {
      this.synth.dispose();
    }
  }
}
