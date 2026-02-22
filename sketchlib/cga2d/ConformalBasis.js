/**
 * This class has some static fuctions for switching
 * between the (p, m) and (inf, o) bases in CGA.
 *
 * From the definitions:
 *
 * inf = m + p
 * o = 1/2(m - p)
 *
 * With a bit of algebra, you can find the inverse
 * mapping:
 *
 * p = 1/2 inf - o
 * m = 1/2 inf + o
 *
 * Derivation: -----------------------------
 *
 * Add the inf equation to 2 times the o equation
 * inf + 2o = m + p + m - p
 * inf + 2o = 2m
 * 1/2 inf + o = m
 *
 * Plug this into the inf equation
 * inf = (1/2 inf + o) + p
 * 1/2 inf = o + p
 * 1/2 inf - o = p
 */
export class ConformalBasis {
  /**
   * Get the origin component
   * @param {number} p The coefficient of the plus basis vector
   * @param {number} m The coefficient of the minus basis vector
   * @returns {number} The coefficient of the origin basis vector
   */
  static get_o(p, m) {
    return 0.5 * (m - p);
  }

  /**
   * Get the infinity component
   * @param {number} p The coefficient of the plus basis vector
   * @param {number} m The coefficient of the minus basis vector
   * @returns {number} The coefficient of the infinity basis vector
   */
  static get_inf(p, m) {
    return m + p;
  }

  /**
   * get the positive component
   * @param {number} inf Coefficient for the infinity basis vector
   * @param {number} o Coefficient for the origin basis vector
   * @returns {number} Coefficient for the plus basis vector
   */
  static get_p(inf, o) {
    return 0.5 * inf - o;
  }

  /**
   * compute the minus component
   * @param {number} inf Coefficient for the infinity basis vector
   * @param {number} o Coefficient for the origin basis vector
   * @returns {number} Coefficient for the minus basis vector
   */
  static get_m(inf, o) {
    return 0.5 * inf + o;
  }
}
