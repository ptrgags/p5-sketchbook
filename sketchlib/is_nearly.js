const DEFAULT_EPSILON = 1e-8;

/**
 * Check if float values are nearly equal using an absolute epsilon test.
 * @param {number} x First value
 * @param {number} y Second value
 * @param {number} [epsilon=DEFAULT_EPSILON] Floating point epsilon
 * @returns {boolean} True if the float values are equal up to an epsilon
 */
export function is_nearly(x, y, epsilon = DEFAULT_EPSILON) {
  // TODO: If this isn't good enough, see https://github.com/ptrgags/math-notebook/blob/main/mobius/src/nearly.rs
  return Math.abs(x - y) < epsilon;
}
