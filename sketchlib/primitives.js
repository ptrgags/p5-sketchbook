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

export class BezierPrimitive {
  constructor(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  static from_b_spline(b0, b1, b2, b3) {
    // See https://en.wikipedia.org/wiki/B-spline#Cubic_B-Splines
    let p0 = b0
      .add(b1.scale(4))
      .add(b2)
      .scale(1 / 6);
    let p1 = b1
      .scale(2)
      .add(b2)
      .scale(1 / 3);
    let p2 = b1.add(b2.scale(2)).scale(1 / 3);
    let p3 = b1
      .add(b2.scale(4))
      .add(b3)
      .scale(1 / 6);

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
