/**
 * A set of static functions that perform vector addition/scalar multiplication
 * for some arbitrary type. For my purposes, the field is assumed to be number
 * @template V The vector type
 * @typedef {Object} VectorSpace
 * @property {function(V, V): V} add
 * @property {function(number, V): V} scale
 */

/**
 * For Runge-Kutta simulations, the vector space is a tuple of
 * coordinates (position1, velocity1, position2, velocity2, etc.) packed
 * into a number[] so we can map addition over it all at once.
 */
export class GeneralizedCoordinates {
  /**
   *
   * @param {number[]} a The first vector
   * @param {number[]} b The second vector
   * @returns {number[]} The sum
   */
  static add(a, b) {
    return a.map((x, i) => x + b[i]);
  }

  /**
   *
   * @param {number} s The scalar
   * @param {number[]} v The second scalar
   * @returns {number[]} The scaled vector
   */
  static scale(s, v) {
    return v.map((x) => x * s);
  }
}
