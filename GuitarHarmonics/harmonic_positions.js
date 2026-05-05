import { Rational } from "../sketchlib/Rational.js";

/**
 * Compute the positions where the nth harmonic
 * will be heard
 * @param {number} n
 * @returns {number[]}
 */
export function harmonic_positions(n) {
  const result = [];
  for (let i = 0; i <= n; i++) {
    const fraction = new Rational(i, n);
    // If the fraction was not in lowest terms,
    // skip it as a lower harmonic will be heard instead.
    if (fraction.denominator !== n) {
      continue;
    }
    result.push(fraction.real);
  }
  return result;
}
