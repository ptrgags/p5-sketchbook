import { ADSR } from "./ADSR.js";
import { Instrument, Polyphony } from "./Instrument.js";

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
   * Initialize the synth
   * @param {import("tone")} tone Tone library
   * @param {Polyphony} polyphony Whether to create a mono or polyphonic synth
   * @param {import("tone").InputNode} destination Audio node to connect to
   */
  init(tone, polyphony, destination) {
    const options = {
      oscillator: {
        type: this.waveform,
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
    if (this.synth.constructor.name === "PolySynth") {
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
