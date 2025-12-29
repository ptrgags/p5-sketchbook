import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import {
  PartialPrimitive,
  Primitive,
} from "../../../sketchlib/primitives/Primitive.js";
import { group } from "../../../sketchlib/primitives/shorthand.js";
import { Tween } from "../../../sketchlib/Tween.js";
import { whole_fract } from "../../../sketchlib/whole_fract.js";

/**
 * Collection of primitives that can be chained together to form a path
 */
export class AnimatedPath {
  /**
   * Constructor
   * @param {PartialPrimitive[]} segments The segments
   * @param {number} start_t Start time (usually a frame number)
   * @param {number} duration Duration in the same units as start_t
   * @param {boolean} reverse If true, the path animates backwards
   */
  constructor(segments, start_t, duration, reverse) {
    this.segments = segments;

    // Configure a tween depending on the reverse parameter
    this.tween = reverse
      ? Tween.scalar(segments.length, 0, start_t, duration)
      : Tween.scalar(0, segments.length, start_t, duration);

    /**
     * Full path for rendering the trajectory underneath the animated
     * path (if desired)
     * @type {GroupPrimitive}
     */
    this.trajectory = group(...segments);
  }

  /**
   * Check if the animation is finished
   * @param {number} time Current time
   * @returns {boolean} True if the animation is finished
   */
  is_done(time) {
    return this.tween.is_done(time);
  }

  /**
   * Get the position at the given time
   * @param {number} time
   * @returns {Point | undefined}
   */
  get_position(time) {
    if (this.segments.length === 0) {
      return undefined;
    }

    const [arc_index, t] = whole_fract(this.tween.get_value(time));

    if (arc_index === this.segments.length) {
      return this.segments.at(-1).get_position(1);
    }

    const partial_segment = this.segments[arc_index];
    return partial_segment.get_position(t);
  }

  /**
   * Get the unit tangent at the given time
   * @param {number} time
   * @returns {Direction | undefined}
   */
  get_tangent(time) {
    if (this.segments.length === 0) {
      return undefined;
    }
    const [arc_index, t] = whole_fract(this.tween.get_value(time));

    if (arc_index === this.segments.length) {
      return this.segments.at(-1).get_tangent(1);
    }

    const partial_segment = this.segments[arc_index];
    return partial_segment.get_tangent(t);
  }

  /**
   * Render the current state of the path
   * @param {number} time
   */
  render(time) {
    const [arc_index, t] = whole_fract(this.tween.get_value(time));

    /**
     * @type {Primitive[]}
     */
    const path = this.segments.slice(0, arc_index);

    const partial_segment = this.segments[arc_index];
    if (partial_segment) {
      path.push(partial_segment.render_partial(t));
    }

    return group(...path);
  }

  /**
   * Render the path between two times
   * @param {number} time_a Start time
   * @param {number} time_b End time
   */
  render_between(time_a, time_b) {
    const [arc_a, t_a] = whole_fract(this.tween.get_value(time_a));
    const [arc_b, t_b] = whole_fract(this.tween.get_value(time_b));
  }
}
