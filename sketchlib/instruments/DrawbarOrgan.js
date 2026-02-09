import { ADSR } from "./ADSR.js";
import { Instrument } from "./Instrument.js";

export class Drawbars {
  /**
   * @param {string} code A string of 9 digits from 0 to 8 that describes the settings for the 9 drawbar values
   */
  constructor(code) {
    const values = code
      .replace(/ /g, "")
      .split("")
      .map((x) => parseInt(x));
    if (values.length !== 9 || values.some((x) => x > 8)) {
      throw new Error("code must have exactly 9 digits in [0, 8]");
    }
    /**
     * The 9 slider values
     * @type {number[]}
     */
    this.values = values;

    // the upper 7 sliders are for harmonics 1-8 (skipping 7)
    // the lower 2 sliders are for harmonics 1 and 3 an octave lower
    const [sub1, sub3, main1, main2, main3, main4, main5, main6, main8] =
      values.map((x) => x / 8);
    this.sub_partials = [sub1, 0, sub3];
    this.main_partials = [main1, main2, main3, main4, main5, main6, 0, main8];
  }
}

/**
 * @typedef {import('tone').DuoSynthOptions} DuoSynthOptions
 **/

/**
 * @template T
 * @typedef {import("tone/build/esm/core/util/Interface.js").RecursivePartial<T>} RecursivePartial<T>
 */

/**
 * @implements {Instrument}
 */
export class DrawbarOrgan {
  /**
   *
   * @param {Drawbars} drawbars The drawbar settings
   * @param {number} [release_time=1] How many seconds for the release stage of the organ envelope
   */
  constructor(drawbars, release_time = 1) {
    this.drawbars = drawbars;

    /**
     * @type {import("tone").DuoSynth | import("tone").PolySynth<import("tone").DuoSynth>}
     */
    this.synth = undefined;

    this.envelope = ADSR.organ(release_time);

    /**
     * @type {RecursivePartial<DuoSynthOptions>}
     */
    this.synth_options = {
      voice0: {
        oscillator: {
          type: "custom",
          partials: this.drawbars.main_partials,
        },
        // Tone.js typechecks that envelope is an object
        // literal... so force this to be an object.
        envelope: { ...this.envelope },
      },
      // Set the harmonicity to 1/2 so voice1 is a sub oscillator
      // one octave lower
      harmonicity: 0.5,
      voice1: {
        oscillator: {
          type: "custom",
          partials: this.drawbars.sub_partials,
        },
        envelope: { ...this.envelope },
      },
      vibratoAmount: 0,
    };
  }

  /**
   * @type {number | undefined}
   */
  get volume() {
    return this.synth?.volume.value;
  }

  /**
   * @param {number} value
   */
  set volume(value) {
    if (this.synth) {
      this.synth.volume.value = value;
    }
  }

  /**
   *
   * @param {import('tone')} tone
   */
  init_mono(tone) {
    this.synth = new tone.DuoSynth(this.synth_options).toDestination();
  }

  /**
   *
   * @param {import('tone')} tone
   */
  init_poly(tone) {
    this.synth = new tone.PolySynth(
      tone.DuoSynth,
      this.synth_options,
    ).toDestination();
  }

  /**
   * Play a note on the organ
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
