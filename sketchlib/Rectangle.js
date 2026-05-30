import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { HEIGHT, WIDTH } from "./dimensions.js";

/**
 * Mathematical description of a rectangle with a corner and dimensions.
 *
 * Not to be confused with RectPrimitive, which is for rendering a rectangle
 */
export class Rectangle {
  /**
   * Constructor
   * @param {Point} position The position of the top left corner
   * @param {Direction} dimensions The dimensions of the rectangle
   */
  constructor(position, dimensions) {
    this.position = position;
    this.dimensions = dimensions;
  }
}
