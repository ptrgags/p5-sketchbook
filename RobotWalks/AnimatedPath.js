import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { Tween } from "../sketchlib/Tween.js";
import { whole_fract } from "../sketchlib/whole_fract.js";

/**
 * A partial primitive is a Primitive that can also render a partial version
 * of itself. For example, a directed line segment or arc can be drawn
 * partially, this is often helpful for animation.
 *
 * @interface PartialPrimitive
 */
export class PartialPrimitive extends Primitive {
  /**
   * Render a partial version of the primitive
   * @param {number} t Interpolation factor in [0, 1]
   * @returns {Primitive}
   */
  render_partial(t) {
    throw new Error("not implemented: render_partial(t)");
  }
}

/**
 * Collection of primitives that can be chained together to form a path
 */
export class AnimatedPath {
  /**
   * Constructor
   * @param {PartialPrimitive[]} segments
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
   *
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
}
