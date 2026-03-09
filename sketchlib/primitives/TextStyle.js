/**
 * Convert string align values to p5.js constants
 * @param {import("p5")} p p5.js library
 * @param {"left" | "center" | "right"} h_align The horizontal align value
 * @returns {import("p5").HORIZ_ALIGN} the corresponding p5.js constant
 */
function get_horizontal_align(p, h_align) {
  switch (h_align) {
    case "center":
      return p.CENTER;
    case "right":
      return p.RIGHT;
    default:
      return p.LEFT;
  }
}

/**
 * Convert string align values to p5.js constants
 * @param {import("p5")} p p5.js library
 * @param {"top" | "bottom" | "center" | "baseline"} v_align The vertical align value
 * @returns {import("p5").VERT_ALIGN} The corresponding p5.js constant
 */
function get_vertical_align(p, v_align) {
  switch (v_align) {
    case "center":
      return p.CENTER;
    case "top":
      return p.TOP;
    case "baseline":
      return p.BASELINE;
    default:
      return p.BOTTOM;
  }
}

/**
 * Style information for text. Only settings that are explicitly set will
 * be applied in p5.js
 */
export class TextStyle {
  /**
   * Constructor. Defaults are based on the values from p.textSize() and p.textAlign()
   * @param {number} [size=12] Text size
   * @param {"left" | "center" | "right"} [h_align="left"] How to align the text horizontally
   * @param {"top" | "bottom" | "center" | "baseline"} [v_align="baseline"] how to align the text vertically
   */
  constructor(size = 12, h_align = "left", v_align = "baseline") {
    this.size = size;
    this.h_align = h_align;
    this.v_align = v_align;
  }

  apply(p) {
    p.textSize(this.size);

    const h_align = get_horizontal_align(p, this.h_align);
    const v_align = get_vertical_align(p, this.v_align);
    p.textAlign(h_align, v_align);
  }
}
TextStyle.DEFAULT = Object.freeze(new TextStyle());
