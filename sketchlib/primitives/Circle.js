import { is_nearly } from "../is_nearly.js";
import { Point } from "../pga2d/Point.js";
import { Primitive } from "./Primitive.js";

/**
 * A circle with a center and radius
 * @implements {Primitive}
 */
export class Circle {
  /**
   * Constructor
   * @param {Point} center The center of the circle
   * @param {number} radius The radius of the circle
   */
  constructor(center, radius) {
    this.center = center;
    this.radius = radius;
  }

  /**
   * Draw a circle
   * @param {import("p5")} p The p5.js library
   */
  draw(p) {
    const { x, y } = this.center;
    p.circle(x, y, 2 * this.radius);
  }

  /**
   * Check if this circle strictly contains the point
   * (i.e. distance squared < r^2)
   * @param {Point} point The point to check
   * @returns {boolean} True if the point is strictly inside the circle.
   */
  contains(point) {
    const dx = point.x - this.center.x;
    const dy = point.y - this.center.y;
    const dist_sqr = dx * dx + dy * dy;
    return dist_sqr <= this.radius * this.radius;
  }

  /**
   * Check if two circles are equal
   * @param {Circle} other
   */
  equals(other) {
    return (
      this.center.equals(other.center) && is_nearly(this.radius, other.radius)
    );
  }

  /**
   * Get the angle the point makes with the horizontal if you were to draw
   * an imaginary line from the circle center to the point
   * @param {Point} point
   * @returns {number} Angle in the range [-pi, pi] (i.e. the result of an atan2() call)
   */
  get_angle(point) {
    const { x, y } = point.sub(this.center);
    return Math.atan2(y, x);
  }

  /**
   * Create a circle through two points on opposite ends of the
   * circle's diameter
   * @param {Point} a first point
   * @param {Point} b second point
   */
  static from_two_points(a, b) {
    const midpoint = Point.lerp(a, b, 0.5);
    const diameter = a.dist(b);
    const radius = diameter / 2;

    return new Circle(midpoint, radius);
  }
}
Circle.UNIT_CIRCLE = Object.freeze(new Circle(Point.ORIGIN, 1));
