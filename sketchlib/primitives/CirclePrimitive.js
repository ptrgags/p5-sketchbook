import { Point } from "../../pga2d/Point.js";
import { Primitive } from "./Primitive.js";

/**
 * A circle with a center and radius
 * @implements {Primitive}
 */
export class CirclePrimitive {
  /**
   * Constructor
   * @param {Point} position The center of the circle
   * @param {number} radius The radius of the circle
   */
  constructor(position, radius) {
    this.position = position;
    this.radius = radius;
  }

  /**
   * Draw a circle
   * @param {import("p5")} p The p5.js library
   */
  draw(p) {
    const { x, y } = this.position;
    p.circle(x, y, 2 * this.radius);
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

    return new CirclePrimitive(midpoint, radius);
  }
}
