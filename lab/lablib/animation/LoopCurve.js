import { mod } from "../../../sketchlib/mod.js";
import { AnimationCurve } from "./AnimationCurve.js";

export class LoopCurve {
  /**
   *
   * @param {AnimationCurve} curve
   */
  constructor(curve) {
    this.curve = curve;
  }

  /**
   * Get the value of the looped curve
   * @param {number} time Time for evaluating the animation curve. If it is out of range, it will be wrapped
   * @returns {number | undefined} Value of the curve at that point, or undefined if the curve is empty
   */
  value(time) {
    const t_looped = mod(time, this.curve.duration);
    return this.curve.value(t_looped);
  }
}
