import { Point } from "../pga2d/Point.js";
import { Primitive } from "../primitives/Primitive.js";
import { CEven } from "./CEven.js";
import { COdd } from "./COdd.js";

/**
 * Null point in 2D CGA (circle with radius 0),
 * used to represent points in the plane.
 *
 *
 * Equation:
 * P = x + 1/2 x^2 inf + o  in (inf, o) basis
 * P = x + 1/2(x^2 - 1) p + 1/2(x^2 + 1) m   in (p, m) basis
 * @implements {Primitive}
 */
export class NullPoint {
  /**
   * Constructor
   * @param {COdd} vector
   */
  constructor(vector) {
    this.vector = vector;
    this.point = new Point(vector.x, vector.y);
  }

  /**
   * Draw the point
   * @param {import('p5')} p
   */
  draw(p) {
    this.point.draw(p);
  }

  /**
   * Transform the point with a versor
   * @param {COdd | CEven} versor
   * @returns {NullPoint}
   */
  transform(versor) {
    const vec = versor.unit_sandwich_odd(this.vector);
    return new NullPoint(vec);
  }

  /**
   * Convert a regular point to a NullPoint
   * @param {Point} point
   * @returns {NullPoint}
   */
  static from_point(point) {
    const { x, y } = point;

    // x + 1/2 x^2 inf + o
    // x + 1/2 x^2 (m + p) + 1/2(m - p)
    // x + 1/2(x^2 - 1) p + 1/2 (x^2 + 1) m
    const squared_factor = x * x + y * y;
    const m = 0.5 * (squared_factor + 1);
    const p = 0.5 * (squared_factor - 1);

    const vector = new COdd(x, y, p, m, 0, 0, 0, 0);
    return new NullPoint(vector);
  }
}
