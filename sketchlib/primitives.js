import { Point } from "../pga2d/objects.js";
import { Style } from "./Style.js";

export class PointPrimitive {
  constructor(position) {
    this.position = position;
  }
}

export class CirclePrimitive {
  constructor(position, radius) {
    this.position = position;
    this.radius = radius;
  }
}

export class RectPrimitive {
  constructor(position, dimensions) {
    this.position = position;
    this.dimensions = dimensions;
  }
}

export class LinePrimitive {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
}

export class VectorPrimitive {
  constructor(tail, tip) {
    this.tail = tail;
    this.tip = tip;
  }
}

export class BezierPrimitive {
  constructor(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

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
    const p0 = Point.point(
      sixth * (x0 + 4 * x1 + x2),
      sixth * (y0 + 4 * y1 + y2)
    );

    // p1 and p2 are just 1/3 and 2/3 of the way across the line segment
    // between the middle points
    const p1 = Point.lerp(b1, b2, 1 / 3);
    const p2 = Point.lerp(b1, b2, 2 / 3);

    // p3 =
    const p3 = Point.point(
      sixth * (x1 + 4 * x2 + x3),
      sixth * (y1 + 4 * y2 + y3)
    );

    return new BezierPrimitive(p0, p1, p2, p3);
  }
}

export class PolygonPrimitive {
  constructor(vertices) {
    this.vertices = vertices;
  }

  *[Symbol.iterator]() {
    yield* this.vertices;
  }
}

export class BeziergonPrimitive {
  constructor(curves) {
    this.curves = curves;
  }

  *[Symbol.iterator]() {
    yield* this.curves;
  }

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
}

/**
 * A logical grouping of primitives to be rendered together, in the order
 * listed in the primitives array. This is the main way to apply styling to
 * primitives.
 *
 * Note: GroupPrimitive can be nested, but the most specific style will be the
 * one that's applied.
 */
export class GroupPrimitive {
  /**
   * Constructor
   * @param {Primitive[]} primitives The primitives in this group
   * @param {Style} [style] An optional style to apply to these primitives.
   */
  constructor(primitives, style) {
    if (!Array.isArray(primitives)) {
      throw new Error("primitives must be an array of Primitive");
    }
    this.primitives = primitives;
    this.style = style;
  }

  *[Symbol.iterator]() {
    yield* this.primitives;
  }
}

/**
 * @typedef {GroupPrimitive | BezierPrimitive | PolygonPrimitive | BezierPrimitive | LinePrimitive | RectPrimitive | CirclePrimitive | PointPrimitive} Primitive
 */
