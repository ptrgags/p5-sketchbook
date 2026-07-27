import { Point } from "../pga2d/Point.js";
import { Primitive } from "./Primitive.js";

/**
 * Draw the mouse coordinates on the canvas under the cursor to help debug them.
 * @implements {Primitive}
 */
export class DebugCoordinates {
  /**
   * Constructor
   */
  constructor() {
    this.mouse_coords = Point.ORIGIN;
  }

  /**
   *
   * @param {import("p5").default} p
   */
  draw(p) {
    const { x, y } = this.mouse_coords;
    const mouse_x = Math.floor(x);
    const mouse_y = Math.floor(y);

    p.push();
    p.textSize(16);
    p.textAlign(p.LEFT, p.BASELINE);

    p.fill(16);
    p.noStroke();
    p.rect(mouse_x, mouse_y - 16, 75, 24);

    p.fill(200);
    p.text(`(${mouse_x}, ${mouse_y})`, mouse_x, mouse_y);
    p.pop();
  }
}
