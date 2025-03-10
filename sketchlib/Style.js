export class Color {
  /**
   * Constructor
   * @param {number} r The red component from 0 to 255
   * @param {number} g The green component from 0 to 255
   * @param {number} b The blue component from 0 to 255
   */
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}
Color.BLACK = Object.freeze(new Color(0, 0, 0));

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

  /**
   * Create a new style that's equivalent to this one but with a new stroke color
   * @param {Color} stroke The new stroke color
   * @returns {Style} a new style with the given stroke color
   */
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
