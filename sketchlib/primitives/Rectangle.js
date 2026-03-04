import { SCREEN_DIMENSIONS } from "../dimensions.js";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";

/**
 * Rectangle
 */
export class Rectangle {
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
   * Get the center of the rectangle
   * @type {Point}
   */
  get center() {
    return this.position.add(this.dimensions.scale(0.5));
  }

  /**
   * Returns true if the point is inside the rectangle
   * @param {Point} point A point to compare with the rectangle
   * @returns {boolean} True if the point is within the bounds of the rectangle
   */
  contains(point) {
    const { x, y } = point;
    const { x: x_min, y: y_min } = this.position;
    const { x: width, y: height } = this.dimensions;
    const x_max = x_min + width;
    const y_max = y_min + height;
    return x >= x_min && x < x_max && y >= y_min && y < y_max;
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
Rectangle.SCREEN_RECT = new Rectangle(Point.ORIGIN, SCREEN_DIMENSIONS);
