import { Point } from "../../pga2d/objects.js";
import { HEIGHT, WIDTH } from "../../sketchlib/dimensions.js";

/**
 * Mathematical description of a rectangle with a corner and dimensions.
 *
 * Not to be confused with RectPrimitive, which is for rendering a rectangle
 */
export class Rectangle {
  /**
   * Constructor
   * @param {Point} position The position of the top left corner
   * @param {Point} dimensions The dimensions of the rectangle
   */
  constructor(position, dimensions) {
    this.position = position;
    this.dimensions = dimensions;
  }

  /**
   * The center of the rectangle
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
}

/**
 * A rectangle that sets the boundary of the screen
 * @type {Rectangle}
 */
export const SCREEN_RECT = new Rectangle(
  Point.ORIGIN,
  Point.direction(WIDTH, HEIGHT)
);
