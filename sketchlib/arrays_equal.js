/**
 * Check if arrays have the same values.
 * @template T
 * @param {Array<T>} a First array
 * @param {Array<T>} b Second array
 * @returns {boolean} True if the arrays have the same contents
 */
export function arrays_equal(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((x, i) => x === b[i]);
}
