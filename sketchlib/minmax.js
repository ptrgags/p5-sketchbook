/**
 * Get the minimum and maximum values from an array of number
 * @param {number[]} values The values
 * @returns {[number, number] | undefined} (min_value, max_value) over the whole array, or undefined if the list was empty
 */
export function minmax(values) {
  if (values.length === 0) {
    return undefined;
  }

  let min_val = Infinity;
  let max_val = -Infinity;
  for (const value of values) {
    min_val = Math.min(min_val, value);
    max_val = Math.max(max_val, value);
  }

  return [min_val, max_val];
}
