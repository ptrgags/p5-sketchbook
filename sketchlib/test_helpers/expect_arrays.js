import { expect } from "vitest";

/**
 * expect.toEqual() doesn't work with custom matchers, so
 * loop over the arrays ourselves.
 * @template T
 * @param {T[]} arr1 First array
 * @param {T[]} arr2 Second array
 * @param {function(T, T):void} expect_func callback function that can use custom matchers
 * @example
 * expect_arrays(result, expected, (result, expected) => expect(result).toBePoint(expected))
 */
export function expect_arrays(arr1, arr2, expect_func) {
  expect(arr1.length).toBe(arr2.length);
  for (let i = 0; i < arr1.length; i++) {
    expect_func(arr1[i], arr2[i]);
  }
}
