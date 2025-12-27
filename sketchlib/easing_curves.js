/**
 * Set of functions from [0, 1] -> [0, 1]
 * for use with Tween
 *
 * Easing curve functions are taken from {@link https://easings.net}
 */
export class Ease {
  /**
   *
   * @param {number} t
   * @returns {number}
   */
  static identity(t) {
    return t;
  }

  /**
   *
   * @param {number} t
   * @returns {number}
   */
  static in_cubic(t) {
    return t * t * t;
  }

  /**
   *
   * @param {number} t
   * @returns {number}
   */
  static out_cubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   *
   * @param {number} t
   * @returns {number}
   */
  static in_out_cubic(t) {
    if (t < 0.5) {
      return 4 * t * t * t;
    }

    return 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
