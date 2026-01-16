import { Oklch } from "./Oklch.js";
import { Color } from "./Color.js";

/**
 * Convert from a variety of color formats to a sRGB color
 * @param {Color | Oklch | string} color A color, an Oklch color, or a string hex code
 * @returns {Color}
 */
function to_srgb(color) {
  if (color instanceof Oklch) {
    return color.to_srgb();
  }

  if (color instanceof Color) {
    return color;
  }

  return Color.from_hex_code(color);
}

/**
 * @typedef {Object} StyleDescriptor
 * @property {Color | Oklch | string | undefined} [stroke] The stroke color. Oklch colors will be turned into srgb
 * @property {number} [width] The stroke width
 * @property {Color | Oklch | string} [fill] The fill color. Oklch colors will be turned into srgb
 */

/**
 * A Style describes the stroke/fill properties of drawing primitives
 */
export class Style {
  /**
   * Constructor
   * @param {StyleDescriptor} options The options for the style
   */
  constructor(options) {
    this.stroke = options.stroke ? to_srgb(options.stroke) : undefined;
    this.fill = options.fill ? to_srgb(options.fill) : undefined;
    this.stroke_width = options.width ?? 1;
  }

  /**
   * Make a copy of this style.
   * @returns {Style} A copy of the style
   */
  clone() {
    return new Style({
      stroke: this.stroke,
      fill: this.fill,
      width: this.stroke_width,
    });
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

  /**
   * Create a new style that's equivalent to this one but with a new fill color
   * @param {Color} fill The new fill color
   * @returns {Style} The new style
   */
  with_fill(fill) {
    const result = this.clone();
    result.fill = fill;
    return result;
  }

  /**
   * Create a new style that's equivalent to this one but with a new stroke width
   * @param {number} width The new stroke width
   * @returns {Style} The new style
   */
  with_width(width) {
    const result = this.clone();
    result.stroke_width = width;
    return result;
  }
}

Style.INVISIBLE = Object.freeze(new Style({}));
Style.DEFAULT_STROKE = Object.freeze(new Style({ stroke: Color.WHITE }));
Style.DEFAULT_FILL = Object.freeze(new Style({ fill: "#6eb2e8" }));
Style.DEFAULT_STROKE_FILL = Object.freeze(
  Style.DEFAULT_FILL.with_stroke(Color.WHITE)
);
