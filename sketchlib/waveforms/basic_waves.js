import { mod } from "../mod.js";

/**
 * It was a sine of the times.
 * Sine wave sin(2pi t)
 * @param {number} t Time value in [0, 1]
 * @returns {number} Sine value in [-1, 1]
 */
export function sine(t) {
  return Math.sin(2 * Math.PI * t);
}

/**
 * Square wave, computed as sign(sin(2pi * t)).
 * @param {number} t Time in [0, 1]
 * @returns {number} Square wave, with a value that toggles between -1 and 1,
 * though the value is 0 at the discontinuities
 */
export function square(t) {
  return Math.sign(sine(t));
}

/**
 * Sawtooth wave
 * @param {number} t Time value in [0, 1]
 * @returns {number} Sawtooth value in [-1, 1]
 */
export function sawtooth(t) {
  return 1 - 2 * mod(t, 1);
}

/**
 * Triangle wave. This is defined so triangle(0) = 0
 * @param {number} t Time value in [0, 1]
 * @returns {number} Triangle value in [-1, 1]
 */
export function triangle(t) {
  // the math below creates a triangle wave that starts at the max value,
  // but I want a triangle wave that starts at 0, so shift by a quarter
  // cycle
  const phase = 0.25;

  // Start with a ramp wave from [0, 1] with period 1. The range is [0, 1]
  const unsigned_ramp = mod(t - phase, 1);
  // scale and shift to a range of [-1, 1]
  const signed_ramp = 2 * unsigned_ramp - 1;
  // applying absolute value folds the wave, producing a triangle wave
  // between [0, 1]
  const unsigned_triangle = Math.abs(signed_ramp);

  // deja vu: we need to convert to a signed value again to get the desired
  // range of [-1, 1]
  return 2 * unsigned_triangle - 1;
}
