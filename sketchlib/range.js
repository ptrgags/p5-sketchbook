/**
 * Generate values 0, 1, ..., n -1 as a generator
 * @param {number} n How many values to generate
 * @returns {Generator<number>}
 */
export function* range(n) {
  for (let i = 0; i < n; i++) {
    yield i;
  }
}
