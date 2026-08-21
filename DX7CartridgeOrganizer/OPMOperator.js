import { OPMEnvelope } from "./OPMEnvelope.js";

/**
 * @typedef {{
 *  envelope: OPMEnvelope,
 *  total_level: number,
 *  keyboard_scaling: number,
 *  multiplier: number,
 *  detune1: number,
 *  detune2: number,
 *  amp_mod_sensitivity_enable: boolean
 * }} OPMOperatorOptions
 */

export class OPMOperator {
  /**
   * Constructor
   * @param {OPMOperatorOptions} options
   */
  constructor(options) {
    this.envelope = options.envelope;
    this.total_level = options.total_level;
    this.keyboard_scaling = options.keyboard_scaling;
    this.multiplier = options.multiplier;
    this.detune1 = options.detune1;
    this.detune2 = options.detune2;
    this.amp_mod_sensitivity_enable = options.amp_mod_sensitivity_enable;
  }
}
