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

export class PolygonPrimitive {
  constructor(vertices) {
    this.vertices = vertices;
  }

  *[Symbol.iterator]() {
    yield* this.vertices;
  }
}

export class GroupPrimitive {
  constructor(primitives, style) {
    this.primitives = primitives;
    this.style = style;
  }

  *[Symbol.iterator]() {
    yield* this.primitives;
  }
}
