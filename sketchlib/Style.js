const REGEX_HEX_COLOR = /^#?[0-9A-Fa-f]{6}$/;

/**
 * Format a u8 as a 2-digit hex number with leading 0s as needed
 * @param {number} value_u8
 */
function format_hex_u8(value_u8) {
  const hex_value = value_u8.toString(16);
  if (hex_value.length === 1) {
    return `0${hex_value}`;
  }

  return hex_value;
}

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

  /**
   * Convert a color to a CSS color code
   * @returns {string} A string in the form #RRGGBB
   */
  to_hex_code() {
    const r = format_hex_u8(this.r);
    const g = format_hex_u8(this.g);
    const b = format_hex_u8(this.b);
    return `#${r}${g}${b}`;
  }

  /**
   * Parse a color from a hex code like RRGGBB or #RRGGBB. This is useful
   * when the input came from an HTML color input
   * @param {string} hex_code The hex code
   * @returns {Color} The parsed color
   */
  static from_hex_code(hex_code) {
    if (!REGEX_HEX_COLOR.test(hex_code)) {
      throw new Error("hex_code must be in the form RRGGBB or #RRGGBB");
    }

    const start = hex_code.charAt(0) === "#" ? 1 : 0;
    const red_string = hex_code.slice(start, start + 2);
    const green_string = hex_code.slice(start + 2, start + 4);
    const blue_string = hex_code.slice(start + 4);

    const red = parseInt(red_string, 16);
    const green = parseInt(green_string, 16);
    const blue = parseInt(blue_string, 16);

    return new Color(red, green, blue);
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
