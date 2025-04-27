/**
 * Lerp for numbers
 * @param {number} a The first number
 * @param {number} b The second number
 * @param {number} t The time value
 * @returns {number} The blend of a and b proportional to t
 */
export function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}