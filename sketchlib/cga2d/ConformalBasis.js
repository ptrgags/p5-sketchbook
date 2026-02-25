/**
 * This class has some static fuctions for switching
 * between the (p, m) and (inf, o) bases in CGA.
 * These are essentially matrix transforms, written as functions
 *
 * For the (inf, 0) -> (p, m) direction, we need a matrix A such that
 * A(inf) = (1, 1) (by definition of inf)
 * A(o) = (-1/2, 1/2) (by definition of o)
 *
 * Since inf is [1, 0] and o is [0, 1] in this basis, the matrix is simply
 * listing these values as columns:
 * A = [1 -1/2]
 *     [1  1/2]
 *
 * For the other direction, it's a matrix inverse. I'll save you the algebra,
 * it's
 *
 * A^(-1) = [1/2 1/2]
 *          [-1   1 ]
 */
export class ConformalBasis {
  /**
   * Get the origin component
   * @param {number} p The coefficient of the plus basis vector
   * @param {number} m The coefficient of the minus basis vector
   * @returns {number} The coefficient of the origin basis vector
   */
  static get_o(p, m) {
    return m - p;
  }

  /**
   * Get the infinity component
   * @param {number} p The coefficient of the plus basis vector
   * @param {number} m The coefficient of the minus basis vector
   * @returns {number} The coefficient of the infinity basis vector
   */
  static get_inf(p, m) {
    return 0.5 * (m + p);
  }

  /**
   * get the positive component
   * @param {number} inf Coefficient for the infinity basis vector
   * @param {number} o Coefficient for the origin basis vector
   * @returns {number} Coefficient for the plus basis vector
   */
  static get_p(inf, o) {
    return inf - 0.5 * o;
  }

  /**
   * compute the minus component
   * @param {number} inf Coefficient for the infinity basis vector
   * @param {number} o Coefficient for the origin basis vector
   * @returns {number} Coefficient for the minus basis vector
   */
  static get_m(inf, o) {
    return inf + 0.5 * o;
  }
}
