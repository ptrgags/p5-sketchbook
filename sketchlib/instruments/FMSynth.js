import { ADSR } from "./ADSR.js";
import { Instrument, Polyphony } from "./Instrument.js";

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
   * Initialize the synth
   * @param {import("tone")} tone Tone library
   * @param {Polyphony} polyphony Whether to create a mono or polyphonic synth
   * @param {import("tone").InputNode} destination Audio node to connect to
   */
  init(tone, polyphony, destination) {
    /**
     * @type {import("./DrawbarOrgan.js").RecursivePartial<import("tone").FMSynthOptions>}
     */
    const options = {
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
    };

    this.synth =
      polyphony === Polyphony.POLYPHONIC
        ? new tone.PolySynth(tone.FMSynth, options)
        : new tone.FMSynth(options);
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
