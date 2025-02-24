import { Point } from "../pga2d/objects.js";

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
}

export class GroupPrimitive {
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
