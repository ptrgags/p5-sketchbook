import { DX7Envelope } from "./DX7Envelope.js";
import { DX7FreqSettings } from "./DX7FreqSettings.js";
import { DX7KeyLevelScaling } from "./DX7KeyLevelScaling.js";

/**
 * @typedef {{
 *  num: number,
 *  envelope: DX7Envelope
 *  level: number,
 *  freq: DX7FreqSettings,
 *  amp_mod_sensitivity: number,
 *  key_vel_sensitivity: number,
 *  key_scaling: DX7KeyLevelScaling
 * }} DX7OperatorOptions
 */

export class DX7Operator {
  /**
   * Constructor
   * @param {DX7OperatorOptions} options
   */
  constructor(options) {
    this.num = options.num;
    this.name = `OP ${options.num}`;
    this.envelope = options.envelope;
    this.level = options.level;
    this.freq = options.freq;
    this.amp_mod_sensitivity = options.amp_mod_sensitivity;
    this.key_scaling = options.key_scaling;
  }

  /**
   * Initialize an operator to default settings
   * @param {number} num
   * @returns {DX7Operator}
   */
  static init(num) {
    // Only Operator 1 is audible by default
    const level = num === 0 ? 99 : 0;

    return new DX7Operator({
      num,
      envelope: DX7Envelope.DEFAULT_ENV,
      level,
      freq: DX7FreqSettings.INIT,
      amp_mod_sensitivity: 0,
      key_vel_sensitivity: 0,
      key_scaling: DX7KeyLevelScaling.INIT,
    });
  }
}
