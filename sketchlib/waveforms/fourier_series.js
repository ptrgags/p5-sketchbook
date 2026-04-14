import { sine } from "./basic_waves.js";

/**
 *
 * @param {[number, number][]} terms Pairs of (amplitude, freq)
 * @returns {function(number):number}
 */
export function fourier_series(terms) {
  const total_amplitude = terms.map(([a]) => a).reduce((a, b) => a + b);
  const normalization = 1 / total_amplitude;

  return (t) => {
    let total = 0;
    for (const [amplitude, freq] of terms) {
      total += amplitude * sine(freq * t);
    }
    return normalization * total;
  };
}
