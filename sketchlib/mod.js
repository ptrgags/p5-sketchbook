/**
 * Modulus that cycles around for negative numbers. This is how modular
 * arithmetic usually works in math.
 * @param {number} x The value (can be negative)
 * @param {number} modulus The modulus
 * @returns {number} x mod modulus always in [0, modulus)
 */
export function mod(x, modulus) {
  return ((x % modulus) + modulus) % modulus;
}
