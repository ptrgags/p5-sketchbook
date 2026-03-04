import { describe, it, expect } from "vitest";
import {
  binary_search,
  binary_search_range,
  compare_ints,
} from "./binary_search.js";
import { AbsInterval } from "./music/AbsTimeline.js";
import { Rational } from "./Rational.js";

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

describe("binary_search_range", () => {
  describe("single interval", () => {
    it("with time range before interval returns empty array", () => {
      const intervals = [new AbsInterval(0, Rational.ZERO, Rational.ONE)];

      const result = binary_search_range(intervals, -10, -9);

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with search range after end returns empty array", () => {
      const intervals = [new AbsInterval(0, Rational.ZERO, Rational.ONE)];

      const result = binary_search_range(intervals, 2, 5);

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with search range inside interval returns interval", () => {
      const intervals = [new AbsInterval(0, Rational.ZERO, Rational.ONE)];

      const result = binary_search_range(intervals, 0.25, 0.75);

      expect(result).toEqual(intervals);
    });

    it("with search range that overlaps the start returns interval", () => {
      const intervals = [new AbsInterval(0, Rational.ZERO, Rational.ONE)];

      const result = binary_search_range(intervals, -1, 0.5);

      expect(result).toEqual(intervals);
    });

    it("with search range that overlaps the end returns interval", () => {
      const intervals = [new AbsInterval(0, Rational.ZERO, Rational.ONE)];

      const result = binary_search_range(intervals, 0.5, 5);

      expect(result).toEqual(intervals);
    });

    it("with search range that covers the whole interval returns the interval", () => {
      const intervals = [new AbsInterval(0, Rational.ZERO, Rational.ONE)];

      const result = binary_search_range(intervals, -1, 3);

      expect(result).toEqual(intervals);
    });

    it("with zero range inside interval returns the interval", () => {
      const intervals = [new AbsInterval(0, Rational.ZERO, Rational.ONE)];

      const result = binary_search_range(intervals, 0.5, 0.5);

      expect(result).toEqual(intervals);
    });

    it("with zero range exactly at start returns the interval", () => {
      const intervals = [new AbsInterval(0, Rational.ZERO, Rational.ONE)];

      const result = binary_search_range(intervals, 0, 0);

      expect(result).toEqual(intervals);
    });

    it("with zero range exactly at end returns empty array", () => {
      const intervals = [new AbsInterval(0, Rational.ZERO, Rational.ONE)];

      const result = binary_search_range(intervals, 1, 1);

      const expected = [];
      expect(result).toEqual(expected);
    });
  });

  describe("two intervals", () => {
    const interval1 = new AbsInterval(1, Rational.ZERO, Rational.ONE);
    const interval2 = new AbsInterval(2, Rational.ONE, new Rational(2));
    const intervals = [interval1, interval2];

    it("with end time at meet point returns only first interval", () => {
      const result = binary_search_range(intervals, -1, 1);

      const expected = [interval1];
      expect(result).toEqual(expected);
    });

    it("with end time in second interval returns both intervals", () => {
      const result = binary_search_range(intervals, -1, 1.5);

      expect(result).toEqual(intervals);
    });

    it("with range straddling boundary point returns both intervals", () => {
      const result = binary_search_range(intervals, 0.5, 1.5);

      expect(result).toEqual(intervals);
    });

    it("with range overlapping second interval returns second interval", () => {
      const result = binary_search_range(intervals, 1.5, 3);

      const expected = [interval2];
      expect(result).toEqual(expected);
    });

    it("with range exactly at boundary returns only second interval", () => {
      const result = binary_search_range(intervals, 1, 1);

      const expected = [interval2];
      expect(result).toEqual(expected);
    });
  });

  describe("two intervals with gap in between", () => {
    const interval1 = new AbsInterval(1, Rational.ZERO, Rational.ONE);
    const interval2 = new AbsInterval(2, new Rational(2), new Rational(3));
    const intervals = [interval1, interval2];

    it("with search range in gap returns empty array", () => {
      const result = binary_search_range(intervals, 1.5, 1.75);

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with search range surrounding first interval returns first interval", () => {
      const result = binary_search_range(intervals, -1, 1.5);

      const expected = [interval1];
      expect(result).toEqual(expected);
    });

    it("with search range straddling gap returns both intervals", () => {
      const result = binary_search_range(intervals, 0.5, 2.5);

      const expected = intervals;
      expect(result).toEqual(expected);
    });

    it("with search range matching gap exactly returns empty array", () => {
      const result = binary_search_range(intervals, 1, 2);

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with search range overlapping second interval returns just that interval", () => {
      const result = binary_search_range(intervals, 1.5, 5);

      const expected = [interval2];
      expect(result).toEqual(expected);
    });
  });

  describe("many intervals", () => {
    const interval1 = new AbsInterval(1, Rational.ZERO, Rational.ONE);
    const interval2 = new AbsInterval(2, new Rational(2), new Rational(3));
    const interval3 = new AbsInterval(3, new Rational(3), new Rational(4));
    const interval4 = new AbsInterval(4, new Rational(5), new Rational(6));
    const intervals = [interval1, interval2, interval3, interval4];

    it("with search range covering all intervals returns the whole array", () => {
      const result = binary_search_range(intervals, -1, 10);

      const expected = intervals;
      expect(result).toEqual(expected);
    });

    it("with search range covering some intervals returns correct slice", () => {
      const result = binary_search_range(intervals, 0.5, 3.5);

      const expected = [interval1, interval2, interval3];
      expect(result).toEqual(expected);
    });

    it("with search interval straddling intervals returns correct intervals", () => {
      const result = binary_search_range(intervals, 1.5, 3.5);

      const expected = [interval2, interval3];
      expect(result).toEqual(expected);
    });
  });
});
