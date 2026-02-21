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
   * Check if two circles are equal
   * @param {Circle} other
   */
  equals(other) {
    this.center.equals(other.center) && is_nearly(this.radius, other.radius);
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
