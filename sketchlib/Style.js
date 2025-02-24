export class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}
Color.WHITE = Object.freeze(new Color(255, 255, 255));
Color.RED = Object.freeze(new Color(255, 0, 0));
Color.GREEN = Object.freeze(new Color(0, 255, 0));
Color.BLUE = Object.freeze(new Color(0, 0, 255));

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

  static from_color(color) {
    return new Style().with_stroke(color).with_fill(color);
  }
}
