import { mod } from "./mod.js";

/**
 * Take the floor and modulo 1 of a number, splitting it into an integer
 * and fractional part
 * @param {number} x A number
 * @returns {[number, number]} (whole_part, fractional_part)
 */
export function whole_fract(x) {
  return [Math.floor(x), mod(x, 1.0)];
}
