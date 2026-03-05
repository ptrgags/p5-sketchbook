import { Point } from "../../sketchlib/pga2d/Point.js";
import { Direction } from "../pga2d/Direction.js";
import { PartialPrimitive, Primitive } from "./Primitive.js";

/**
 * Cubic Bezier curve
 * @implements {PartialPrimitive}
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
      sixth * (y0 + 4 * y1 + y2),
    );

    // p1 and p2 are just 1/3 and 2/3 of the way across the line segment
    // between the middle points
    const p1 = Point.lerp(b1, b2, 1 / 3);
    const p2 = Point.lerp(b1, b2, 2 / 3);

    // p3 =
    const p3 = new Point(
      sixth * (x1 + 4 * x2 + x3),
      sixth * (y1 + 4 * y2 + y3),
    );

    return new BezierPrimitive(p0, p1, p2, p3);
  }

  render_partial(t) {
    // See https://pomax.github.io/bezierinfo/#splitting for
    // a full explanation, but basically if you look at the
    // points of de Casteljau's algorithm,
    // a    b    c     d
    //   ab    bc   cd
    //     abbc bccd
    //         B
    // the first bezier  is (a, ab, abbc, B),
    // the second bezier is (B, bccd, cd, d)
    // we only want the first half since we're rendering from
    // [0, t]
    const { a, b, c, d } = this;
    const ab = Point.lerp(a, b, t);
    const bc = Point.lerp(b, c, t);
    const cd = Point.lerp(c, d, t);
    const abbc = Point.lerp(ab, bc, t);
    const bccd = Point.lerp(bc, cd, t);
    const bezier_point = Point.lerp(abbc, bccd, t);

    return new BezierPrimitive(a, ab, abbc, bezier_point);
  }

  render_between(t_start, t_end) {
    // Based on the curve subdivision (see render_partial above),
    // let's derive rendering between two t values
    // we start with a curve [0, 1]
    // split it on the end time and take the first half
    // which covers [0, t_end]
    // then split the result at t value (t_start / t_end)
    // (percentage of the new length) to get the control
    // points for [t_start, t_end]

    const { a, b, c, d } = this;
    const ab_end = Point.lerp(a, b, t_end);
    const bc_end = Point.lerp(b, c, t_end);
    const cd_end = Point.lerp(c, d, t_end);
    const abbc_end = Point.lerp(ab_end, bc_end, t_end);
    const bccd_end = Point.lerp(bc_end, cd_end, t_end);
    const bezier_end = Point.lerp(abbc_end, bccd_end, t_end);

    // control points for the [0, t_end] portion
    const a2 = a;
    const b2 = ab_end;
    const c2 = abbc_end;
    const d2 = bezier_end;

    // t_start is relative to the original curve, we need
    // to rescale to the [0, t_end] curve
    const t = t_start / t_end;

    // split again at time t, this results in a curve
    // between [t_start, t_end] on the original curve.
    const ab_start = Point.lerp(a2, b2, t);
    const bc_start = Point.lerp(b2, c2, t);
    const cd_start = Point.lerp(c2, d2, t);
    const abbc_start = Point.lerp(ab_start, bc_start, t);
    const bccd_start = Point.lerp(bc_start, cd_start, t);
    const bezier_start = Point.lerp(abbc_start, bccd_start, t);

    // This time we take the second half
    return new BezierPrimitive(bezier_start, bccd_start, cd_start, d2);
  }

  get_position(t) {
    // A bezier curve when expanded is:
    // B(T) = (1-t)^3 a + 3 (1-t)^2 t b + 3 (1-t) t^2 c + t^3 d
    const s = 1.0 - t;
    const coeff_a = s * s * s;
    const coeff_b = 3 * s * s * t;
    const coeff_c = 3 * s * t * t;
    const coeff_d = t * t * t;

    const { x: ax, y: ay } = this.a;
    const { x: bx, y: by } = this.b;
    const { x: cx, y: cy } = this.c;
    const { x: dx, y: dy } = this.d;

    const x = coeff_a * ax + coeff_b * bx + coeff_c * cx + coeff_d * dx;
    const y = coeff_a * ay + coeff_b * by + coeff_c * cy + coeff_d * dy;
    return new Point(x, y);
  }

  get_tangent(t) {
    // B(t) = (1-t)^3 a + 3 (1-t)^2 t b + 3 (1-t) t^2 c + t^3 d
    // let p(t) = t, p'(t) = 1
    //     q(t) = 1 - t, q'(t) = -1
    // B(t) = q^3 a + 3 q^2 p b + 3 q p^2 c + p^3 d
    // B'(t) = 3q^2 q' a + 3(2q q' p + q^2 p') b + 3(q' p^2 + q 2p p') c + 3p^2 p' d
    //       = -3q^2 a + 3(-2qp + q^2) b + 3(-p^2 + 2qp) c + 3p^2 d
    // substitute back in p and q
    //       = -3(1-t)^2 a + 3((1-t)^2 - 2(1-t)t) b + 3(2(1-t)t - t^2) c + 3t^2 d
    // since we only care about a unit tangent, we can divide by 3
    //       = -(1-t)^2 a + ((1-t)^2 - 2(1-t)t) b + (2(1-t)t - t^2) c + t^2 d

    const s = 1 - t;
    const coeff_a = -s * s;
    const coeff_b = s * s - 2 * s * t;
    const coeff_c = 2 * s * t - t * t;
    const coeff_d = t * t;

    const { x: ax, y: ay } = this.a;
    const { x: bx, y: by } = this.b;
    const { x: cx, y: cy } = this.c;
    const { x: dx, y: dy } = this.d;

    const x = coeff_a * ax + coeff_b * bx + coeff_c * cx + coeff_d * dx;
    const y = coeff_a * ay + coeff_b * by + coeff_c * cy + coeff_d * dy;
    return new Direction(x, y).normalize();
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
