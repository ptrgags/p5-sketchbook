/**
 * @typedef {{
 *  attack_rate: number,
 *  decay1_rate: number,
 *  decay2_rate: number,
 *  decay1_level: number,
 *  release_rate: number,
 * }} OPMEnvelopeOptions
 */

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
}
