import { lerp } from "../../../sketchlib/lerp.js";

/**
 * Piecewise Linear function defined by a number of points listed in
 * order by x coordinate. In between the x values, values are interpolated
 * linearly.
 */
export class PiecewiseLinear {
  /**
   * Constructor
   * @param {[number, number][]} points List of (x, y) pairs. The x values must be in sorted order!
   */
  constructor(points) {
    if (points.length < 1) {
      throw new Error("points must have at least one entry!");
    }

    this.points = points;
  }

  /**
   * Get the value of the function
   * @param {number} x input value
   * @returns {number} The output value of the function
   */
  value(x) {
    if (x < this.points[0][0]) {
      return this.points[0][1];
    }

    if (x >= this.points[this.points.length - 1][0]) {
      return this.points[this.points.length - 1][1];
    }

    const larger_index = this.points.findIndex((point) => point[0] > x);
    const smaller_index = larger_index - 1;

    const [large_x, large_y] = this.points[larger_index];
    const [small_x, small_y] = this.points[smaller_index];
    return lerp(small_y, large_y, (x - small_x) / (large_x - small_x));
  }
}
