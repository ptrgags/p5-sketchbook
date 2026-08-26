import {
  DX7FreqMode,
  DX7FreqSettings,
} from "../sketchlib/dx7/DX7FreqSettings.js";
import { DX7KeyLevelScaling } from "../sketchlib/dx7/DX7KeyLevelScaling.js";
import { DX7Operator } from "../sketchlib/dx7/DX7Operator.js";
import { Tween } from "../sketchlib/Tween.js";
import { OPMEnvelope } from "./OPMEnvelope.js";

// the OPM stores the total level inverted with 0 being full scale, and larger
// values indicating smaller volumes (like negative DB).
// so we want to map [0, 127] to [99, 0]
const MAP_LEVEL = Tween.scalar(99, 0, 0, 127);

const MAP_RATE_SCALE = Tween.scalar(0, 7, 0, 3);

/**
 * @typedef {{
 *  envelope: OPMEnvelope,
 *  total_level: number,
 *  keyboard_rate_scaling: number,
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
    this.keyboard_rate_scaling = options.keyboard_rate_scaling;
    this.multiplier = options.multiplier;
    this.detune1 = options.detune1;
    this.detune2 = options.detune2;
    this.amp_mod_sensitivity_enable = options.amp_mod_sensitivity_enable;
  }

  to_dx7_op() {
    const coarse = this.multiplier;
    // TODO: I still haven't determined how this is computed
    const fine = 0;

    return new DX7Operator({
      // the number will be overridden by OPMVoice
      num: 1,
      envelope: this.envelope.to_dx7_env(),
      level: MAP_LEVEL.get_value(this.total_level),
      freq: new DX7FreqSettings(DX7FreqMode.RATIO, 0, coarse, fine),
      key_rate_scaling: MAP_RATE_SCALE.get_value(this.keyboard_rate_scaling),
      amp_mod_sensitivity: this.amp_mod_sensitivity_enable ? 3 : 0,
      // Unused on the OPM, so use defaults
      key_level_scaling: DX7KeyLevelScaling.INIT,
      key_vel_sensitivity: 0,
    });
  }
}
