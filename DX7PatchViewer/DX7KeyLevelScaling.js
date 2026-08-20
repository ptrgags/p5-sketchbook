import { MIDIPitch } from "../sketchlib/music/MIDIPitch.js";
import { A_1 } from "../sketchlib/music/pitches.js";

/**
 * There are four keyboard scaling types, -LIN, -EXP, +EXP, +LIN
 * @enum {number}
 */
export const DX7ScalingCurveType = {
  NEG_LIN: 0,
  NEG_EXP: 1,
  POS_EXP: 2,
  POS_LIN: 3,
};

const CURVE_NAMES = ["-LIN", "-EXP", "+EXP", "+LIN"];

export class DX7ScalingCurve {
  /**
   * Constructor
   * @param {DX7ScalingCurveType} curve
   * @param {number} depth
   */
  constructor(curve, depth) {
    this.curve = curve;
    this.depth = depth;
  }

  toString() {
    return `${CURVE_NAMES[this.curve]}(${this.depth})`;
  }
}

DX7ScalingCurve.INIT = Object.freeze(
  new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 0),
);

export class DX7KeyLevelScaling {
  /**
   * Constructor
   * @param {number} rate_scale
   * @param {number} breakpoint 0-99, with 0=A-1, 99=C8
   * @param {DX7ScalingCurve} left_curve
   * @param {DX7ScalingCurve} right_curve
   */
  constructor(rate_scale, breakpoint, left_curve, right_curve) {
    this.rate_scale = rate_scale;
    this.breakpoint = breakpoint;
    this.left_curve = left_curve;
    this.right_curve = right_curve;
  }

  /**
   * Convert breakpoint MIDI
   * @type {number}
   */
  get breakpoint_midi() {
    return A_1 + this.breakpoint;
  }

  /**
   * Format the breakpoint as a MIDI note
   */
  get breakpoint_name() {
    return MIDIPitch.format_pitch(this.breakpoint_midi);
  }

  toString() {
    return `<--${this.left_curve}--${this.breakpoint_name}(${this.rate_scale})-->${this.right_curve}`;
  }
}
DX7KeyLevelScaling.INIT = Object.freeze(
  new DX7KeyLevelScaling(0, 0, DX7ScalingCurve.INIT, DX7ScalingCurve.INIT),
);
