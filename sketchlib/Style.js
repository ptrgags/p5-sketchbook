export class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

export class Style {
  constructor() {
    this.stroke = undefined;
    this.fill = undefined;
    this.stroke_width = 1;
  }

  clone() {
    const result = new Style();
    result.stroke = this.stroke;
    result.fill = this.fill;
    result.stroke_width = this.stroke_width;
    return result;
  }

  with_stroke(stroke) {
    const result = this.clone();
    result.stroke = stroke;
    return result;
  }

  with_fill(fill) {
    const result = this.clone();
    result.fill = fill;
    return result;
  }

  with_width(width) {
    const result = this.clone();
    result.stroke_width = width;
    return result;
  }
}
