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
import { clamp } from "../../../sketchlib/clamp.js";

/**
 * Collection of primitives that can be chained together to form a path
 */
export class AnimatedPath {
  /**
   * Constructor
   * @param {PartialPrimitive[]} segments The segments
   * @param {number} start_t Start time (usually a frame number)
   * @param {number} duration Duration in the same units as start_t
   */
  constructor(segments, start_t, duration) {
    this.segments = segments;

    this.tween = Tween.scalar(0, segments.length, start_t, duration);

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
   * @return {Primitive} the resulting portion of the path. May be empty.
   */
  render_between(time_a, time_b) {
    // Clamp values to make it easier to handle out-of-bounds values
    time_a = clamp(time_a, this.tween.start_time, this.tween.end_time);
    time_b = clamp(time_b, this.tween.start_time, this.tween.end_time);

    if (time_a >= time_b) {
      return GroupPrimitive.EMPTY;
    }

    const [arc_a, t_a] = whole_fract(this.tween.get_value(time_a));
    const [arc_b, t_b] = whole_fract(this.tween.get_value(time_b));

    if (arc_a === arc_b) {
      return this.segments[arc_a].render_between(t_a, t_b);
    }

    return group(
      this.segments[arc_a].render_between(t_a, 1),
      ...this.segments.slice(arc_a + 1, arc_b),
      this.segments[arc_b].render_between(0, t_b)
    );
  }
}
