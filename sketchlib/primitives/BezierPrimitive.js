import { Point } from "../../pga2d/Point.js";

/**
 * Cubic Bezier curve
 */
export class BezierPrimitive {
  /**
   * Constructor
   * @param {Point} a Start point
   * @param {Point} b First tangent point
   * @param {Point} c Second tangent point
   * @param {Point} d End point
   */
  constructor(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  /**
   * Convert from a B-spline to a bezier curve. B-splines can be used to
   * smooth out a sharp polygon into a smooth curve.
   * @param {Point} b0 First control point
   * @param {Point} b1 Second control point
   * @param {Point} b2 Third control point
   * @param {Point} b3 Fourth control point
   * @returns {BezierPrimitive} The equivalent Bezier curve
   */
  static from_b_spline(b0, b1, b2, b3) {
    // See https://en.wikipedia.org/wiki/B-spline#Cubic_B-Splines

    // To avoid a lot of temporary allocations, the polynomials are
    // computed explicitly
    const { x: x0, y: y0 } = b0;
    const { x: x1, y: y1 } = b1;
    const { x: x2, y: y2 } = b2;
    const { x: x3, y: y3 } = b3;

    // p0 = 1/6(b0 + 4 b1 + b2)
    const sixth = 1 / 6;
    const p0 = new Point(
      sixth * (x0 + 4 * x1 + x2),
      sixth * (y0 + 4 * y1 + y2)
    );

    // p1 and p2 are just 1/3 and 2/3 of the way across the line segment
    // between the middle points
    const p1 = Point.lerp(b1, b2, 1 / 3);
    const p2 = Point.lerp(b1, b2, 2 / 3);

    // p3 =
    const p3 = new Point(
      sixth * (x1 + 4 * x2 + x3),
      sixth * (y1 + 4 * y2 + y3)
    );

    return new BezierPrimitive(p0, p1, p2, p3);
  }

  /**
   * Draw a single bezier curve
   * @param {import("p5")} p The p5.js library
   */
  draw(p) {
    const { a, b, c, d } = this;
    p.bezier(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
  }
}
