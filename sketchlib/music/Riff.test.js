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
