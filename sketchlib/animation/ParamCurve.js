import { Ease } from "../Ease.js";
import { Gap, TimeInterval } from "../music/Timeline.js";
import { Rational } from "../Rational.js";

export class ParamCurve {
  /**
   * Constructor
   * @param {number} start_value Initial value
   * @param {number} end_value Final value
   * @param {function(number): number} [easing_curve=Ease.identity] Easing curve
   */
  constructor(start_value, end_value, easing_curve = Ease.identity) {
    this.start_value = start_value;
    this.end_value = end_value;
    this.easing_curve = easing_curve;
  }

  /**
   * Shorthand for ParamCurve(value, value)
   * for making a constant interval
   * @param {number} value Start/end
   * @returns {ParamCurve}
   */
  static const_val(value) {
    return new ParamCurve(value, value);
  }
}

/**
 * Convenience for making a param curve and wrapping it in a TimeInterval
 * to match old usage.
 * @param {number} start_value
 * @param {number} end_value
 * @param {Rational} duration
 * @param {function(number): number} [easing_curve]
 * @returns {TimeInterval<ParamCurve>}
 */
export function make_param(start_value, end_value, duration, easing_curve) {
  return new TimeInterval(
    new ParamCurve(start_value, end_value, easing_curve),
    duration,
  );
}

/**
 * Alias for Gap to make it clearer that we're holding the
 * previous animation curve value (or the first/last value)
 * if the hold appears at the ends of the timeline.
 */
export const Hold = Gap;
