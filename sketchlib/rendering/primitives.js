import { Point } from "../../pga2d/objects.js";

/**
 * A single point. This is rendered as a small circle of fixed size.
 */
export class PointPrimitive {
  /**
   * Constructor
   * @param {Point} position The position for this point
   */
  constructor(position) {
    this.position = position;
  }
}

/**
 * A circle with a center and radius
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
}

/**
 * Rectangle
 */
export class RectPrimitive {
  /**
   * Constructor
   * @param {Point} position The top left corner of the rectangle as a Point.point
   * @param {Point} dimensions The dimensions of the rectangle as a Point.direction
   */
  constructor(position, dimensions) {
    this.position = position;
    this.dimensions = dimensions;
  }
}

/**
 * Line segment
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
}

/**
 * Draw an arrow from tail to tip
 */
export class VectorPrimitive {
  /**
   * Constructor
   * @param {Point} tail The tail end of the arrow
   * @param {Point} tip The tip end of the arrow
   */
  constructor(tail, tip) {
    this.tail = tail;
    this.tip = tip;
  }
}

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

/**
 * A closed polygon
 */
export class PolygonPrimitive {
  /**
   * Constructor
   * @param {Point[]} vertices Vertices of the polygon. Do not repeat the first point, closing the polygon is handled automatically.
   */
  constructor(vertices) {
    this.vertices = vertices;
  }

  *[Symbol.iterator]() {
    yield* this.vertices;
  }
}

/**
 * A curved polygon where the edges are Bezier curves
 */
export class BeziergonPrimitive {
  /**
   * Constructor
   * @param {BezierPrimitive[]} curves The
   */
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
 * Text primitive
 */
export class TextPrimitive {
  /**
   * Constructor
   * @param {string} text The text to display
   * @param {Point} position The position to anchor the text
   */
  constructor(text, position) {
    this.text = text;
    this.position = position;
  }
}

/**
 * @typedef {BezierPrimitive | PolygonPrimitive | BezierPrimitive | LinePrimitive | RectPrimitive | CirclePrimitive | PointPrimitive | BeziergonPrimitive | VectorPrimitive | TextPrimitive} SimplePrimitive
 */
