import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";

/**
 * Interface for geometric primitives that can be drawn when passed a p5
 * instance. Some properties of primitives:
 *
 * - Primitives are composable. GroupPrimitive acts as a container
 * for other primitives, with additional styling and transformations.
 * - Often, I like to make primitives immutable. Construct as much as I can
 * once at the start of a sketch, then render as often as needed.
 * - However, in scenes with dynamic geometry, there may be cases where I
 * make primitives with inner immutability if that helps with performance.
 * - This decouples my sketch code (which uses a lot of custom types like Point)
 * from the p5 drawing commands
 *
 * @interface Primitive
 */
export class Primitive {
  /**
   * Draw the primitive to the screen
   * @param {import("p5")} p the p5.js instance
   */
  draw(p) {}
}

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
    throw new Error("not implemented");
  }

  /**
   * Render a partial version of the primitive between the two given times
   * @param {number} t_start start t value in [0, 1]
   * @param {number} t_end end t value in [0, 1]
   * @returns {Primitive}
   */
  render_between(t_start, t_end) {
    throw new Error("not implemented");
  }

  /**
   * Get the position at time t in the curve
   * @param {number} t Interpolation factor in [0, 1]
   * @returns {Point} Current point at the curve a time t
   */
  get_position(t) {
    throw new Error("not implemented");
  }

  /**
   * Get a tangent direction at time t
   * @param {number} t Interpolation factor in [0, 1]
   * @returns {Direction} Unit direction along the curve at time t
   */
  get_tangent(t) {
    throw new Error("not implemented");
  }
}
