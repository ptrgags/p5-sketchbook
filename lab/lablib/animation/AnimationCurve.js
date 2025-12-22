import { Tween } from "../../../sketchlib/Tween.js";
import { to_events } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import { ParamCurve } from "./ParamCurve.js";
import { PiecewiseLinear } from "./PiecewiseLinear.js";

export class AnimationCurve {
  /**
   * Constructor
   * @param {Tween[]} tweens
   */
  constructor(tweens) {
    this.tweens = tweens;

    /**
     * @type {[number, number][]}
     */
    const start_times = tweens.map((x, i) => [x.start_time, i]);
    start_times.push([tweens[tweens.length - 1].end_time, tweens.length]);

    /**
     * Mapping of animation time -> [0, N]
     * @type {PiecewiseLinear}
     */
    this.time_to_index = new PiecewiseLinear(start_times);
  }

  /**
   *
   * @param {number} time Time to evaluate the animation curve
   * @returns {number | undefined} Value of the curve at that point, or undefined if the curve is empty
   */
  value(time) {
    if (this.tweens.length === 0) {
      return undefined;
    }

    const float_index = this.time_to_index.value(time);
    const tween_index = Math.floor(float_index);
    const t = time - tween_index; // fract

    if (tween_index === this.tweens.length) {
      return this.tweens[tween_index - 1].end_value;
    }

    return this.tweens[tween_index].get_value(t);
  }

  /**
   * Convert a timeline of parameter curves to an AnimationCurve
   * @param {import("../music/Timeline").Timeline<ParamCurve>} timeline Timeline of curves
   * @returns {AnimationCurve}
   */
  static from_timeline(timeline) {
    const events = to_events(Rational.ZERO, timeline);
    const tweens = events.map(([curve, start_time]) => {
      return Tween.scalar(
        curve.start_value,
        curve.end_value,
        start_time.real,
        curve.duration.real
      );
    });
    return new AnimationCurve(tweens);
  }
}
