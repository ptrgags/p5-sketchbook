/**
 * Interface for a parametric curve where
 * you can convert between normalized t values
 * and arc length (sometimes up to an approximation
 * as arc length can be expensive)
 * @interface ArcLength
 */
export class ArcLength {
  /**
   * Get the total arc length. This must be
   * the same as get_arc_length(1)
   * @type {number}
   */
  get arc_length() {
    throw new Error("not implemented");
  }

  /**
   * Get the arc line at a given t value
   * @param {number} t Time value in [0, 1]
   * @returns {number} The corresponding arc length
   */
  get_arc_length(t) {
    throw new Error("not implemented");
  }

  /**
   * Given an arc length relative to the start of the curve,
   * get the t value.
   * @param {number} arc_length Arc length between in [0, this.get_arc_length(1)]
   * @returns {number} The corresponding t value
   */
  get_t(arc_length) {
    throw new Error("not implemented");
  }
}
