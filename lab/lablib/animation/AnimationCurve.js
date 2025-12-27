import { Tween } from "../../../sketchlib/Tween.js";
import { to_events } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import { ParamCurve } from "./ParamCurve.js";
import { PiecewiseLinear } from "./PiecewiseLinear.js";

/**
 * Iterate over a collection of tweens, filling gaps with
 * constant tweens, holding the end value of the previous tween.
 * @param {Tween<number>[]} tweens List of tween
 * @return {Generator<Tween<number>>}
 */
function* fill_gaps(tweens) {
  for (let i = 1; i < tweens.length; i++) {
    const before = tweens[i - 1];
    const after = tweens[i];
    yield before;
    if (before.end_time < after.start_time) {
      yield Tween.scalar(
        before.end_value,
        before.end_value,
        before.end_time,
        after.start_time - before.end_time
      );
    }
  }
  yield tweens[tweens.length - 1];
}

/**
 * Single animation curve - a function from the current animation
 * time (e.g. elapsed time in seconds, musical time in measures)
 */
export class AnimationCurve {
  /**
   * Constructor
   * @param {Tween<number>[]} tweens
   */
  constructor(tweens) {
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

    // Remap the tweens to have a domain of [0, 1] so we can use them with time_to_index
    this.tweens = tweens.map((x) =>
      Tween.scalar(x.start_value, x.end_value, 0, 1, x.easing_curve)
    );
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
    const t = float_index - tween_index; // fract

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
      // Tween is from [start_time, start_time + duration] -> [start_value, end_value]
      return Tween.scalar(
        curve.start_value,
        curve.end_value,
        start_time.real,
        curve.duration.real,
        curve.easing_curve
      );
    });
    const with_holds = [...fill_gaps(tweens)];

    return new AnimationCurve(with_holds);
  }
}
