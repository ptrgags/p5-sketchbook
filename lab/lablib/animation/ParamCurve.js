import { Gap } from "../music/Timeline.js";
import { Rational } from "../Rational.js";

export class ParamCurve {
  /**
   * Constructor
   * @param {number} start_value Initial value
   * @param {number} end_value Final value
   * @param {Rational} duration Duration of the interval
   */
  constructor(start_value, end_value, duration) {
    this.start_value = start_value;
    this.end_value = end_value;
    this.duration = duration;
  }

  /**
   * Shorthand for ParamCurve(value, value, duration)
   * for making a constant interval
   * @param {number} value Start/end
   * @param {Rational} duration Duration of the value
   * @returns {ParamCurve}
   */
  static const_val(value, duration) {
    return new ParamCurve(value, value, duration);
  }
}

/**
 * Alias for Gap to make it clearer that we're holding the
 * previous animation curve value (or the first/last value)
 * if the hold appears at the ends of the timeline.
 */
export const Hold = Gap;
