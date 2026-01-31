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
      },
      envelope: this.envelope,
    };

    if (voices > 1) {
      this.synth = new tone.PolySynth({
        options,
        voice: tone.Synth,
        maxPolyphony: voices,
      });
    } else {
      this.synth = new tone.Synth(options);
    }

    this.synth.connect(destination);
  }

  /**
   * Play a note
   * @param {string} pitch
   * @param {string} duration
   * @param {number} time
   * @param {number} velocity
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
