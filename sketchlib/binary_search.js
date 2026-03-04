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
 * Internal recursive implementation
 * @template T
 * @param {T[]} arr Array of values, assumed to be in sorted order with at least one entry.
 * @param {number} key The value to search for
 * @param {function(T, number): number} compare Function that compares the value with the current key and returns either
 * @param {number} [start_index = 0] First index in range (inclusive)
 * @param {number} [end_index] Last index in range (inclusive)
 * @returns {[number, T | undefined]} if there's a match, return (index, value). If the key was before the start, returns (-Infinity, undefined). If the key was after the end, returns (Infinity, undefined). If the key was in the gap between two elements, returns (prev_index, undefined)
 */
function binary_search_recursive(
  arr,
  key,
  compare,
  start_index = 0,
  end_index,
) {
  if (end_index === undefined) {
    end_index = arr.length - 1;
  }

  if (end_index < start_index) {
    return [undefined, undefined];
  }

  if (start_index === end_index) {
    const start_val = arr[start_index];
    const result = compare(arr[start_index], key);

    // If we matched, we return (index, value). If we didn't match, then
    // the key is between array entries. In that case, we want to return
    // (index_before_gap, undefined)
    const val = result === CompareResult.MATCH ? start_val : undefined;
    const before_index =
      result === CompareResult.LEFT ? start_index - 1 : start_index;
    return [before_index, val];
  }

  const mid_index = Math.floor((start_index + end_index) / 2);
  const val_mid = arr[mid_index];

  const result = compare(val_mid, key);
  if (result === CompareResult.MATCH) {
    return [mid_index, val_mid];
  } else if (result === CompareResult.LEFT) {
    return binary_search_recursive(
      arr,
      key,
      compare,
      start_index,
      mid_index - 1,
    );
  } else {
    return binary_search_recursive(arr, key, compare, mid_index + 1, end_index);
  }
}

/**
 * Search through an array in O(lg n) time
 * @template T
 * @param {T[]} arr Array of values. The values must be sorted by key
 * @param {number} key The value to search for
 * @param {function(T, number): CompareResult} compare Function that compares the value with the current key and returns either
 * @returns {[number, T] | undefined} Either (index, value) if a match was found, or undefined if there was no match
 */
export function binary_search(arr, key, compare) {
  if (arr.length === 0) {
    return undefined;
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
  } else if (end_result === CompareResult.RIGHT) {
    return undefined;
  }

  // the recursive call returns (index, value | undefined), but we want
  // (index, value) | undefined
  const result = binary_search_recursive(arr, key, compare);
  if (result[1] === undefined) {
    return undefined;
  }
  return result;
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
  if (end_time < start_time) {
    throw new Error("end_time must be greater than or equal to start_time");
  }

  if (intervals.length === 0) {
    return [];
  }

  // Check if the query range is completely out of bounds and short-circuit
  const t_start = intervals[0].start_time.real;
  const t_end = intervals.at(-1).end_time.real;
  if (start_time >= t_end || end_time <= t_start) {
    return [];
  }

  // Check if we've selected the whole range and short-circuit
  if (start_time <= t_start && end_time >= t_end) {
    return intervals;
  }

  let start_index;
  let end_index;

  if (start_time <= t_start) {
    // selecting from left end of array
    start_index = 0;
    [end_index] = binary_search_recursive(
      intervals,
      end_time,
      compare_intervals_end,
    );
  } else if (end_time >= t_end) {
    // selecting from right end of array
    let value;
    [start_index, value] = binary_search_recursive(
      intervals,
      start_time,
      compare_intervals_start,
    );
    if (value === undefined) {
      // We're in a gap between entries and start_index is the index before
      // the gap, so add one
      start_index++;
    }

    end_index = intervals.length - 1;
  } else {
    // selecting from middle of array
    let value;
    [start_index, value] = binary_search_recursive(
      intervals,
      start_time,
      compare_intervals_start,
    );
    if (value === undefined) {
      // we're in a gap between entries and start_index is the index before
      // this one, so add one
      start_index++;
    }

    [end_index] = binary_search_recursive(
      intervals,
      end_time,
      compare_intervals_end,
    );
  }
  return intervals.slice(start_index, end_index + 1);
}
