/**
 * Style information for text. Only settings that are explicitly set will
 * be applied in p5.js
 */
export class TextStyle {
  /**
   * Constructor
   * @param {number} [size] Text size
   * @param {"left" | "center" | "right"} [h_align] How to align the text horizontally
   * @param {"top" | "bottom" | "center" | "baseline"} [v_align] how to align the text vertically
   */
  constructor(size, h_align, v_align) {
    this.size = size;
    this.align = h_align;
    this.v_align = v_align;
  }
}
TextStyle.DEFAULT = Object.freeze(new TextStyle());
