import { Point } from "../../pga2d/objects.js";

/**
 * Rectangle
 */
export class RectPrimitive {
  /**
   * Constructor
   * @param {Point} position The top left corner of the rectangle as a Point.point
   * @param {Point} dimensions The dimensions of the rectangle as a Point.direction
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
