import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { PartialPrimitive } from "./Primitive.js";

/**
 * Line segment
 * @implements {PartialPrimitive}
 */
export class LinePrimitive {
  /**
   * Constructor
   * @param {Point} a The start point
   * @param {Point} b The end point
   */
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  /**
   * Draw a line segment
   * @param {import("p5")} p The p5.js library
   */
  draw(p) {
    const a = this.a;
    const b = this.b;
    p.line(a.x, a.y, b.x, b.y);
  }

  /**
   * Render a partial version of the primitive
   * @param {number} t Interpolation factor in [0, 1]
   * @returns {LinePrimitive}
   */
  render_partial(t) {
    const b = Point.lerp(this.a, this.b, t);
    return new LinePrimitive(this.a, b);
  }

  /**
   * Render a partial version of the primitive between the two given times
   * @param {number} t_start start t value in [0, 1]
   * @param {number} t_end end t value in [0, 1]
   * @returns {LinePrimitive}
   */
  render_between(t_start, t_end) {
    const a = Point.lerp(this.a, this.b, t_start);
    const b = Point.lerp(this.a, this.b, t_end);
    return new LinePrimitive(a, b);
  }

  /**
   * Get the position at time t in the curve
   * @param {number} t Interpolation factor in [0, 1]
   * @returns {Point} Current point at the curve a time t
   */
  get_position(t) {
    return Point.lerp(this.a, this.b, t);
  }

  /**
   * Get a tangent direction at time t
   * @param {number} _t Interpolation factor in [0, 1] (not used, but part of PartialPrimitive interface)
   * @returns {Direction} Unit direction along the curve at time t
   */
  get_tangent(_t) {
    // For a line, the direction is constant
    return this.b.sub(this.a).normalize();
  }
}
