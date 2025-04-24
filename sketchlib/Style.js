import { Color } from "./Color.js";

/**
 * @typedef {Object} StyleDescriptor
 * @property {Color} [stroke] The stroke color
 * @property {number} [width] The stroke width
 * @property {Color} [fill] The fill color
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
    this.stroke = options.stroke;
    this.fill = options.fill;
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
Style.DEFAULT_FILL = Object.freeze(
  new Style({ fill: Color.from_hex_code("#6eb2e8") })
);
Style.DEFAULT_STROKE_FILL = Object.freeze(
  Style.DEFAULT_FILL.with_stroke(Color.WHITE)
);

