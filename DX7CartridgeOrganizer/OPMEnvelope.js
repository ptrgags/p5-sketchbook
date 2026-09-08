/**
 * @typedef {{
 *  attack_rate: number,
 *  decay1_rate: number,
 *  decay2_rate: number,
 *  decay1_level: number,
 *  release_rate: number,
 * }} OPMEnvelopeOptions
 */

import { DX7Envelope } from "../sketchlib/dx7/DX7Envelope.js";
import { Tween } from "../sketchlib/Tween.js";

const MAP_RATE = Tween.scalar(0, 99, 0, 31);
const MAP_RELEASE_RATE = Tween.scalar(0, 99, 0, 15);
const MAP_LEVEL = Tween.scalar(0, 99, 0, 15);

export class OPMEnvelope {
  /**
   * Constructor
   * @param {OPMEnvelopeOptions} options
   */
  constructor(options) {
    this.attack_rate = options.attack_rate;
    this.decay1_rate = options.decay1_rate;
    this.decay2_rate = options.decay2_rate;
    this.decay1_level = options.decay1_level;
    this.release_rate = options.release_rate;
  }

  to_dx7_env() {
    const rates = [
      MAP_RATE.get_value(this.attack_rate),
      MAP_RATE.get_value(this.decay1_rate),
      MAP_RATE.get_value(this.decay2_rate),
      MAP_RELEASE_RATE.get_value(this.release_rate),
    ];

    const sustain_level = MAP_LEVEL.get_value(this.decay1_level);

    const levels = [99, sustain_level, sustain_level, 0];
    return new DX7Envelope(rates, levels);
  }
}
