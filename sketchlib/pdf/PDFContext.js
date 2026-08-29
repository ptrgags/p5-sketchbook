import { Color } from "../Color.js";
import { Style } from "../Style.js";

// If no style is set, make it very obvious by setting the color
// to an obnoxiously loud full brightness magenta and green
const OBNOXIOUSLY_PINK = new Style({
  fill: Color.MAGENTA,
  stroke: Color.GREEN,
});

export class PDFContext {
  /**
   * Constructor
   * @param {import('pdf-lib')} lib The PDF library for access to top-level functions
   * @param {import('pdf-lib').PDFPage} page The current page to draw
   */
  constructor(lib, page) {
    this.lib = lib;
    this.page = page;

    /**
     * @type {Style[]}
     */
    this.style_stack = [];
  }

  push_state() {
    this.page.pushOperators(this.lib.pushGraphicsState());
  }

  pop_state() {
    this.page.pushOperators(this.lib.popGraphicsState());
  }

  /**
   * Apply a style to the page, but also push it on a stack to help
   * with determining stroke/fill commands later
   * @param {Style} style
   */
  push_style(style) {
    this.style_stack.push();

    if (style.stroke) {
      const { r, g, b } = style.stroke;
      this.page.pushOperators(
        this.lib.setStrokingRgbColor(r / 255, g / 255, b / 255),
      );
    }

    if (style.stroke_width) {
      this.page.pushOperators(this.lib.setLineWidth(style.stroke_width));
    }

    if (style.fill) {
      const { r, g, b } = style.fill;
      this.page.pushOperators(
        this.lib.setFillingRgbColor(r / 255, g / 255, b / 255),
      );
    }
  }

  pop_style() {
    this.style_stack.pop();
  }

  get current_draw_command() {
    const current_style = this.style_stack.at(-1) ?? OBNOXIOUSLY_PINK;

    if (current_style.stroke && current_style.fill) {
      return this.lib.fillAndStroke();
    }

    if (current_style.stroke) {
      return this.lib.stroke();
    }

    if (current_style.fill) {
      return this.lib.fill();
    }

    throw new Error("pdf invisible styling");
  }
}
