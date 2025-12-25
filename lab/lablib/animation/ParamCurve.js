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
}

export const Hold = Gap;
