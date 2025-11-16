import { is_nearly } from "./is_nearly.js";
import { mod } from "./mod.js";

/**
 * Reduce a range of angles so that a is within [0, 2pi).
 * b may be outside this range.
 * @param {number} a First angle in radians
 * @param {number} b Second angle in radians 
 * @returns {number[]} [a, b] such that a is within [0, 2pi)
 */
function reduce_angles(a, b) {
  const reduced_a = mod(a, 2.0 * Math.PI);
  const reduced_b = (b - a) + reduced_a;

  return [reduced_a, reduced_b]
}

/**
 * Angles for describing a circular arc. The angles are described as either
 * positive or negative. It's up to the caller to determine if positive means
 * CCW (math) or CW (p5.js y-down coordinates)
 */
export class ArcAngles {
  /**
   * Constructor
   * @param {number} start_angle Absolute start angle in radians
   * @param {number} end_angle Absolute end angle in radians
   */
  constructor(start_angle, end_angle) {
    const magnitude = Math.abs(start_angle - end_angle);
    if (magnitude > 2.0 * Math.PI) {
      throw new Error("angle must be no bigger than 2pi")
    }

    const [start, end] = reduce_angles(start_angle, end_angle);
    this.start_angle = start;
    this.end_angle = end;
  }

  /**
   * Check if two arc angles represent the same angle
   * @param {ArcAngles} other Another pair of angles
   * @returns {boolean} True if the angles are equal
   */
  equals(other) {
    return is_nearly(this.start_angle, other.start_angle) && is_nearly(this.end_angle, other.end_angle);
  }

  /**
   * Get the direction from start to end
   * @type {number} +1 for positive direction, -1 for negative, 0 for a 0 angle that has no direction
   */
  get direction() {
    return Math.sign(this.end_angle - this.start_angle)
  }
}
