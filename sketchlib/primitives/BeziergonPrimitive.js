import { Point } from "../../pga2d/objects.js";
import { BezierPrimitive } from "./BezierPrimitive.js";
import { Primitive } from "./Primitive.js";

/**
 * A curved polygon where the edges are Bezier curves. The shape is always
 * closed
 * @implements {Primitive}
 */
export class BeziergonPrimitive {
  /**
   * Constructor
   * @param {BezierPrimitive[]} curves The curves that make up the beziergon
   
   */
  constructor(curves) {
    this.curves = curves;
  }

  *[Symbol.iterator]() {
    yield* this.curves;
  }

  /**
   * Interpolate a set of points using B-splines, phrased as a beziergon
   * @param {Point[]} points Points
   * @returns {BeziergonPrimitive} A beziergon interpolating the points
   */
  static interpolate_points(points) {
    const bezier_curves = [];
    const n = points.length;

    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % n];
      const c = points[(i + 2) % n];
      const d = points[(i + 3) % n];
      const curve = BezierPrimitive.from_b_spline(a, b, c, d);
      bezier_curves.push(curve);
    }

    return new BeziergonPrimitive(bezier_curves);
  }

  /**
   *
   * @param {import("p5")} p p5.js instance
   */
  draw(p) {
    p.beginShape();
    const first_point = this.curves[0].a;
    p.vertex(first_point.x, first_point.y);
    for (const { b, c, d } of this) {
      p.bezierVertex(b.x, b.y, c.x, c.y, d.x, d.y);
    }
    p.endShape(p.CLOSE);
  }
}
