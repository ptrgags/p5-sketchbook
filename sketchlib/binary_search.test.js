import { describe, it, expect } from "vitest";
import { binary_search, compare_ints } from "./binary_search.js";

describe("binary_search", () => {
  it("with empty array returns undefind", () => {
    const result = binary_search([], 3, compare_ints);

    expect(result).toBeUndefined();
  });

  describe("one element array", () => {
    it("with key before first element returns undefined", () => {
      const arr = [2];

      const result = binary_search(arr, 1, compare_ints);

      expect(result).toBeUndefined();
    });

    it("with key matching element returns that element and index", () => {
      const arr = [3];

      const result = binary_search(arr, 3, compare_ints);

      const expected = [0, 3];
      expect(result).toEqual(expected);
    });

    it("with key after element returns undefined", () => {
      const arr = [3];

      const result = binary_search(arr, 5, compare_ints);

      expect(result).toBeUndefined();
    });
  });

  describe("two element array", () => {
    it("with key before first element returns undefined", () => {
      const arr = [3, 5];

      const result = binary_search(arr, 1, compare_ints);

      expect(result).toBeUndefined();
    });

    it("with key in between elements returns undefined", () => {
      const arr = [3, 5];

      const result = binary_search(arr, 4, compare_ints);

      expect(result).toBeUndefined();
    });

    it("with key after last element returns undefined", () => {
      const arr = [3, 5];

      const result = binary_search(arr, 10, compare_ints);

      expect(result).toBeUndefined();
    });

    it("with key matching value returns that index and value", () => {
      const arr = [3, 5];

      const result = binary_search(arr, 5, compare_ints);

      const expected = [1, 5];
      expect(result).toEqual(expected);
    });
  });

  describe("many element array", () => {
    it("with key before start returns undefined", () => {
      const arr = [2, 5, 8, 15];

      const result = binary_search(arr, 0, compare_ints);

      expect(result).toBeUndefined();
    });

    it("with key after end returns undefined", () => {
      const arr = [2, 5, 8, 15];

      const result = binary_search(arr, 20, compare_ints);

      expect(result).toBeUndefined();
    });

    it("with key between values returns undefined", () => {
      const arr = [2, 5, 8, 15];

      const result = binary_search(arr, 6, compare_ints);

      expect(result).toBeUndefined();
    });

    it("with key matching value returns that index and value", () => {
      const arr = [2, 5, 8, 15];

      const result = binary_search(arr, 8, compare_ints);

      const expected = [2, 8];
      expect(result).toEqual(expected);
    });
  });
});
