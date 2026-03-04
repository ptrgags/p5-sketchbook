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
 * @param {T[]} arr Array of values, assumed to be in sorted order
 * @param {number} key The value to search for
 * @param {function(T, number): number} compare Function that compares the value with the current key and returns either
 * @param {number} start_index First index in range (inclusive)
 * @param {number} end_index Last index in range (inclusive)
 * @returns {[number, T] | undefined} Either (index, value) if a match was found, or undefined if there was no match
 */
function binary_search_recursive(arr, key, compare, start_index, end_index) {
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
 * @template T
 * @param {T[]} arr
 * @param {number} key The value to search for
 * @param {function(T, number): CompareResult} compare Function that compares the value with the current key and returns either
 * @param {number} [start_index = 0]
 * @param {number} [end_index]
 * @returns {[number, T] | undefined} Either (index, value) if a match was found, or undefined if there was no match
 */
export function binary_search(arr, key, compare, start_index, end_index) {
  if (arr.length === 0) {
    // No values, short circuit
    return undefined;
  }

  if (end_index === undefined) {
    end_index = arr.length - 1;
  }

  // check the key against the start and end of the array and short-circuit
  const start_result = compare(arr[0], key);
  if (start_result === CompareResult.MATCH) {
    return [0, arr[0]];
  } else if (start_result === CompareResult.LEFT) {
    return undefined;
  }
  const end_result = compare(arr.at(-1), key);
  if (end_result === CompareResult.MATCH) {
    return [arr.length - 1, arr.at(-1)];
  } else if (start_result === CompareResult.RIGHT) {
    return undefined;
  }

  return binary_search_recursive(arr, key, compare, start_index, end_index);
}

/**
 * Compare integers for an exact match
 * @param {number} value The current value
 * @param {number} key The search key
 * @returns {CompareResult}
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

/**
 * Use binary search to select a range of intervals
 * @template T
 * @param {AbsInterval<T>[]} intervals Intervals to search through. The intervals must be in sorted order by start time. There can be gaps in between, but the intervals may not overlap
 * @param {number} start_time Start time
 * @param {number} end_time End time
 * @returns {AbsInterval<T>[]} Selected intervals
 */
export function binary_search_range(intervals, start_time, end_time) {
  const start_result = binary_search(
    intervals,
    start_time,
    compare_intervals_start,
  );
  const end_result = binary_search(intervals, end_time, compare_intervals_end);

  if (!start_result && !end_result) {
    // nothing in the selected range
    return [];
  }

  if (!start_result && end_result) {
    const [end_index] = end_result;
    return intervals.slice(0, end_index + 1);
  }

  if (start_result && !end_result) {
    const [start_index] = start_result;
    return intervals.slice(start_index);
  }

  const [start_index] = start_result;
  const [end_index] = end_result;

  return intervals.slice(start_index, end_index + 1);
}
