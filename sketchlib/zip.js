/**
 * Zip two arrays together into a new array
 * @template T
 * @template U
 * @param {T[]} a First array
 * @param {U[]} b Second array
 * @returns {[T, U][]}
 */
export function zip(a, b) {
  if (a.length !== b.length) {
    throw new Error("array lengths must match");
  }

  return a.map((x, i) => [x, b[i]]);
}
