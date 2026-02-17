import { describe, it, expect } from "vitest";
import { PatternGrid } from "./PatternGrid.js";
import { N2T, N4, N4T, N8T } from "./durations.js";
import { Rational } from "../Rational.js";

describe("PatternGrid", () => {
  it("length returns array length", () => {
    const grid = new PatternGrid([1, 2, 3, 4, 5, 6], N4);

    expect(grid.length).toBe(6);
  });

  it("duration computes total length based on step size", () => {
    const grid = new PatternGrid([1, 2, 3, 4, 5, 6], N4);

    const expected = new Rational(6, 4);
    expect(grid.duration).toEqual(expected);
  });

  describe("scale", () => {
    it("scales step size, leaving values unchanged", () => {
      const pattern = new PatternGrid([1, 2, 3], N4);

      const result = pattern.scale(new Rational(2, 3));

      // A 1/n triplet is 2/3 the length of a 1/n note
      const expected = new PatternGrid([1, 2, 3], N4T);
      expect(result).toEqual(expected);
    });
  });

  describe("subdivide", () => {
    it("with zero throws error", () => {
      const pattern = new PatternGrid([1, 2, 3], N4);

      expect(() => {
        return pattern.subdivide(0);
      }).toThrowError("factor must be a positive integer");
    });

    it("with negative factor throws error", () => {
      const pattern = new PatternGrid([1, 2, 3], N4);

      expect(() => {
        return pattern.subdivide(-2);
      }).toThrowError("factor must be a positive integer");
    });

    it("with factor of 1 returns same grid", () => {
      const pattern = new PatternGrid([1, 2, 3], N4);

      const result = pattern.subdivide(1);

      expect(result).toEqual(pattern);
    });

    it("with factor repeats values that many times", () => {
      const pattern = new PatternGrid([1, 2, 3], N4);

      const result = pattern.subdivide(3);

      // 1/4 divided into 3 is 1/12 which is an eighth note triplet
      // to check, 9 * 1/12 = 3/4, so the overall duration is the same ✅
      const expected = new PatternGrid([1, 1, 1, 2, 2, 2, 3, 3, 3], N8T);
      expect(result).toEqual(expected);
    });
  });

  describe("merge", () => {
    it("with patterns of different durations throws error", () => {
      const a = new PatternGrid([1, 2, 3], N4);
      const b = new PatternGrid([1, 2, 3, 4], N4);

      expect(() => {
        return PatternGrid.merge(a, b, (x, y) => x + y);
      }).toThrowError("grids must have the same duration");
    });

    it("with empty patterns returns empty pattern", () => {
      const a = PatternGrid.empty();
      const b = PatternGrid.empty();

      const result = PatternGrid.merge(a, b, (x, y) => x + y);

      const expected = PatternGrid.empty();
      expect(result).toEqual(expected);
    });

    it("with pattern grids of the same shape merges values", () => {
      const letters = new PatternGrid(["a", "b", "c"], N4);
      const numbers = new PatternGrid([1, 2, 3], N4);
      /** @type {function(string, number): string} */
      const format = (letter, number) => `${letter}-${number}`;

      const result = PatternGrid.merge(letters, numbers, format);

      const expected = new PatternGrid(["a-1", "b-2", "c-3"], N4);
      expect(result).toEqual(expected);
    });

    it("with patterns of the same duration merge values on a subdivided grid automatically", () => {
      // A signle half-note triplet is 1/3 of a measure
      const letters = new PatternGrid(["a", "b", "c"], N2T);
      const numbers = new PatternGrid([1, 2, 3, 4], N4);
      /** @type {function(string, number): string} */
      const format = (letter, number) => `${letter}-${number}`;

      const result = PatternGrid.merge(letters, numbers, format);

      const expected = new PatternGrid(
        // scan each column vertically to see the combos
        // a---b---c---
        // 1--2--3--4--
        [
          "a-1",
          "a-1",
          "a-1",
          "a-2",
          "b-2",
          "b-2",
          "b-3",
          "b-3",
          "c-3",
          "c-4",
          "c-4",
          "c-4",
        ],
        // result should be on a grid
        // gcd(1/3, 1/4) = gcd(1, 1)/lcm(3, 4) = 1/12
        // which is an 8th note triplet
        N8T,
      );
      expect(result).toEqual(expected);
    });
  });
});
