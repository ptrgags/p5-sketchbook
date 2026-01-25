/**
 *
 * @template T
 * @param {{[key: string]: T}} dict
 * @returns {function(T):string}
 */
export function reverse_lookup(dict) {
  /**
   * @type {Map<T, string>}
   */
  const reverse_map = new Map();
  for (const [key, value] of Object.entries(dict)) {
    reverse_map.set(value, key);
  }

  return (value) => {
    return reverse_map.get(value);
  };
}
