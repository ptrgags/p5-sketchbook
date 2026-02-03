import { mod } from "./mod.js";

/**
 * Greatest common divisor
 * @param {number} a The first number
 * @param {number} b The second number
 * @returns {number} The greatest common divisor
 */
export function gcd(a, b) {
  if (a < 0 || !isFinite(a)) {
    throw new Error("a must be a non-negative integer");
  }

  if (b < 0 || !isFinite(b)) {
    throw new Error("b must be a non-negative integer");
  }

  if (b > a) {
    return gcd(b, a);
  }

  if (b === 0) {
    return a;
  }

  return gcd(b, mod(a, b));
}

/**
 * Least common multiple, lcm(a, b) = ab/gcd(a, b)
 * @param {number} a The first number
 * @param {number} b The second number
 * @returns The least common multiple of the two numbers
 */
export function lcm(a, b) {
  if (a < 1 || !isFinite(a)) {
    throw new Error("a must be a positive integer");
  }

  if (b < 1 || !isFinite(b)) {
    throw new Error("b must be a positive integer");
  }

  return (a * b) / gcd(a, b);
}
