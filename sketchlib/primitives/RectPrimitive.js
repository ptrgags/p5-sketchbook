import { Direction } from "../../sketchlib/pga2d/Direction.js";
import { Point } from "../../sketchlib/pga2d/Point.js";

/**
 * Rectangle
 */
export class RectPrimitive {
  /**
   * Constructor
   * @param {Point} position The top left corner of the rectangle as a Point
   * @param {Direction} dimensions The dimensions of the rectangle as a Direction
   */
  constructor(position, dimensions) {
    this.position = position;
    this.dimensions = dimensions;
  }

  /**
   * Draw a rectangle to the screen
   * @param {import("p5")} p p5.js library
   */
  draw(p) {
    const { x, y } = this.position;
    const { x: w, y: h } = this.dimensions;
    p.rect(x, y, w, h);
  }
}
