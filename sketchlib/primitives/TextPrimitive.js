import { Point } from "../../sketchlib/pga2d/Point.js";
import { Primitive } from "./Primitive.js";

/**
 * Text drawn on the screen. For text styling, see GroupPrimitive
 *
 * @implements {Primitive}
 */
export class TextPrimitive {
  /**
   * Constructor
   * @param {string} text The text to display
   * @param {Point} position The position to anchor the text
   */
  constructor(text, position) {
    this.text = text;
    this.position = position;
  }

  /**
   * Draw the text to the screen.
   * @param {import("p5")} p p5.js context
   */
  draw(p) {
    const { x, y } = this.position;
    p.text(this.text, x, y);
  }
}
