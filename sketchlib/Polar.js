/**
 * Struct for storing polar coordinates with getters to convert to
 * rectangular coordinates.
 */
export class Polar {
  /**
   * Constructor
   * @param {number} r The radius
   * @param {number} theta The angle
   */
  constructor(r, theta) {
    this.r = r;
    this.theta = theta;
  }

  /**
   * Compute the rectangular x coordinate
   * @returns {number} The x-coordinate
   */
  get x() {
    return this.r * Math.cos(this.theta);
  }

  /**
   * Compute the rectangular y coordinate
   * @returns {number} The y-coordinate
   */
  get y() {
    return this.r * Math.sin(this.theta);
  }
}
