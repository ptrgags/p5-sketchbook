import { describe, it, expect } from "vitest";
import { Rhythm } from "./Rhythm.js";
import { N4, N8 } from "./durations.js";
import { Riff } from "./Riff.js";
import { PatternGrid } from "./PatternGrid.js";

describe("Riff", () => {
  describe("constructor", () => {
    it("with too few values throws error", () => {
      const rhythm = new Rhythm("x.x.x.x.", N4);

      expect(() => {
        // oops, this rhythm needs 4 values!
        return new Riff(rhythm, [1, 2, 3]);
      }).toThrowError("values must have the same length");
    });

    it("with too many values throws error", () => {
      const rhythm = new Rhythm("x.x.x.x.", N4);

      expect(() => {
        // oops, this rhythm needs 4 values!
        return new Riff(rhythm, [1, 2, 3, 4, 5]);
      }).toThrowError("values must have the same length");
    });
  });

  it("beat_iter includes the values", () => {
    const riff = Riff.literal("x.x--.xx", ["A", "B", "C", "D"], N8);

    const result = riff.beat_iter().toArray();

    const expected = [["A", 1], 1, ["B", 3], 1, ["C", 1], ["D", 1]];
    expect(result).toEqual(expected);
  });

  describe("map", () => {
    it("maps function over values", () => {
      const pattern = Riff.literal("x.x.x.", [1, 2, 3], N4);

      const result = pattern.map((x) => `x = ${x}`);

      const expected = Riff.literal("x.x.x.", ["x = 1", "x = 2", "x = 3"], N4);
      expect(result).toEqual(expected);
    });

    it("maps function with index", () => {
      const pattern = Riff.literal("x--x--x--", ["a", "b", "c"], N4);

      const result = pattern.map((x, i) => `a[${i}] = ${x}`);

      const expected = Riff.literal(
        "x--x--x--",
        ["a[0] = a", "a[1] = b", "a[2] = c"],
        N4,
      );
      expect(result).toEqual(expected);
    });
  });

  describe("concat", () => {
    it("with no riffs returns empty riff", () => {
      const result = Riff.concat();

      const expected = Riff.empty();
      expect(result).toEqual(expected);
    });

    it("with one riff returns it", () => {
      const pattern = Riff.literal("x.x.x.", [1, 2, 3], N4);

      const result = Riff.concat(pattern);

      const expected = pattern;
      expect(result).toBe(expected);
    });

    it("with riffs of mismatched step sizes throws error", () => {
      const pattern1 = Riff.literal("x.x.x.", [1, 2, 3], N4);
      const pattern2 = Riff.literal("x.x.x.", [1, 2, 3], N8);
      expect(() => {
        return Riff.concat(pattern1, pattern2);
      }).toThrowError("grids must have the same step size");
    });

    it("concats two riffs", () => {
      const pattern1 = Riff.literal("xxx", [1, 2, 3], N4);
      const pattern2 = Riff.literal("x-x-", [4, 5], N4);

      const result = Riff.concat(pattern1, pattern2);

      const expected = Riff.literal("xxxx-x-", [1, 2, 3, 4, 5], N4);
      expect(result).toEqual(expected);
    });

    it("concats many riffs", () => {
      const pattern1 = Riff.literal("x.x.x.", [1, 2, 3], N4);
      const pattern2 = Riff.literal("x-x-", [4, 5], N4);
      const pattern3 = Riff.literal("x.x.x.", [6, 7, 8], N4);
      const pattern4 = Riff.literal("x-x-", [9, 10], N4);

      const result = Riff.concat(pattern1, pattern2, pattern3, pattern4);

      const expected = Riff.literal(
        "x.x.x.x-x-x.x.x.x-x-",
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        N4,
      );
      expect(result).toEqual(expected);
    });
  });

  describe("literal", () => {
    it("with constant value repeats value", () => {
      const rhythm_str = "x-x.x-x.";
      const result = Riff.literal("x-x.x-x.", 3, N8);

      const expected = new Riff(new Rhythm(rhythm_str, N8), [3, 3, 3, 3]);
      expect(result).toEqual(expected);
    });

    it("with array of values slices to length of pattern", () => {
      const rhythm_str = "x-x.x-x.";
      const result = Riff.literal("x-x.x-x.", [1, 2, 3, 4, 5, 6], N8);

      const expected = new Riff(new Rhythm(rhythm_str, N8), [1, 2, 3, 4]);
      expect(result).toEqual(expected);
    });

    it("with pattern grid ignores step sizes", () => {
      const rhythm_str = "x-x.x-x.";
      const result = Riff.literal(
        "x-x.x-x.",
        new PatternGrid([1, 2, 3, 4], N4),
        N8,
      );

      const expected = new Riff(new Rhythm(rhythm_str, N8), [1, 2, 3, 4]);
      expect(result).toEqual(expected);
    });
  });
});
