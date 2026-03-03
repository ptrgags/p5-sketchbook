import { AbsInterval } from "./music/AbsTimeline.js";

/**
 * Result of the compare function for binary search
 * @enum {number}
 */
export const CompareResult = {
  LEFT: -1,
  MATCH: 0,
  RIGHT: 1,
};
Object.freeze(CompareResult);

/**
 * @template T
 * @param {T[]} arr
 * @param {number} key The value to search for
 * @param {function(T, number): CompareResult} compare Function that compares the value with the current key and returns either
 * @param {number} [start_index = 0]
 * @param {number} [end_index]
 * @returns {[number, T] | undefined} Either (index, value) if a match was found, or undefined if there was no match
 */
export function binary_search(arr, key, compare, start_index = 0, end_index) {
  if (arr.length === 0) {
    return undefined;
  }

  if (end_index === undefined) {
    end_index = arr.length - 1;
  }

  if (end_index < start_index) {
    return undefined;
  }

  if (start_index === end_index) {
    const start_val = arr[start_index];
    const result = compare(arr[start_index], key);
    return result === CompareResult.MATCH
      ? [start_index, start_val]
      : undefined;
  }

  const mid_index = Math.floor((start_index + end_index) / 2);
  const val_mid = arr[mid_index];

  const result = compare(val_mid, key);
  if (result === CompareResult.MATCH) {
    return [mid_index, val_mid];
  } else if (result === CompareResult.LEFT) {
    return binary_search(arr, key, compare, start_index, mid_index);
  } else {
    return binary_search(arr, key, compare, mid_index, end_index);
  }
}

/**
 *
 * @param {*} value
 * @param {*} key
 * @returns
 */
export function compare_ints(value, key) {
  if (key === value) {
    return CompareResult.MATCH;
  }

  if (key > value) {
    return CompareResult.RIGHT;
  }

  return CompareResult.LEFT;
}

/**
 * Comparator for intervals by start time
 * @template T
 * @param {AbsInterval<T>} interval Interval to compare with
 * @param {number} time Search time
 * @returns {CompareResult}
 */
export function compare_intervals_start(interval, time) {
  if (time < interval.start_time.real) {
    return CompareResult.LEFT;
  }

  if (time >= interval.end_time.real) {
    return CompareResult.RIGHT;
  }

  return CompareResult.MATCH;
}

/**
 * Comparator for searching for an interval by the end time
 * @template T
 * @param {AbsInterval<T>} interval Interval to compare with
 * @param {number} time The search time
 * @returns {CompareResult}
 */
export function compare_intervals_end(interval, time) {
  if (time <= interval.start_time.real) {
    return CompareResult.LEFT;
  }

  if (time > interval.end_time.real) {
    return CompareResult.RIGHT;
  }

  return CompareResult.MATCH;
}
