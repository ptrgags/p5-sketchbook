import { Point } from "../../sketchlib/pga2d/Point.js";
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
   * @param {import("p5").default} p p5.js instance
   */
  draw(p) {
    // If we don't have at least one cur
    if (this.curves.length === 0) {
      return;
    }

    p.beginShape(p.PATH);

    // in p5.js 2.0 bezierVertex works differently. You set the start
    // point (`a` for the first curve), then `b, c, d` for all curves.
    const start = this.curves[0].a;
    p.bezierVertex(start.x, start.y);

    for (const { b, c, d } of this) {
      p.bezierVertex(b.x, b.y);
      p.bezierVertex(c.x, c.y);
      p.bezierVertex(d.x, d.y);
    }
    p.endShape(p.CLOSE);
  }
}
