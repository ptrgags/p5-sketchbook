/**
 * Angles for describing a circular arc
 */
export class ArcAngles {
  /**
   * Constructor
   * @param {number} start_angle Start angle in radians
   * @param {number} end_angle End angle in radians
   */
  constructor(start_angle, end_angle) {
    this.start_angle = start_angle;
    this.end_angle = end_angle;
  }

  get is_ccw() {
    return this.start_angle < this.end_angle;
  }
}
