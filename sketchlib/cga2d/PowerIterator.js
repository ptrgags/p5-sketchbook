import { CVersor } from "./CVersor.js";

/**
 * Simple iterator over powers of a transformations
 */
export class PowerIterator {
  /**
   * Constructor
   * @param {CVersor} versor
   */
  constructor(versor) {
    this.versor = versor;
    this.inv_versor = versor.inv();
  }

  /**
   * Iterate from powers from min_power to max_power,
   * @param {number} min_power
   * @param {number} max_power
   * @returns {CVersor[]}
   */
  iterate(min_power, max_power) {
    const negative_start_pow = Math.min(-1, max_power);
    const negative_iters = negative_start_pow - min_power + 1;
    const negative_start = this.versor.pow(negative_start_pow);
    const negative_powers = [];
    let versor = negative_start;
    for (let i = 0; i < negative_iters; i++) {
      negative_powers.push(versor);
      versor = this.inv_versor.compose(versor);
    }
    negative_powers.reverse();

    const positive_start_pow = Math.max(0, min_power);
    const positive_start = this.versor.pow(positive_start_pow);
    const positive_iters = max_power - positive_start_pow + 1;
    const positive_powers = [];
    versor = positive_start;
    for (let i = 0; i < positive_iters; i++) {
      positive_powers.push(versor);
      versor = this.versor.compose(versor);
    }

    return [...negative_powers, ...positive_powers];
  }
}
