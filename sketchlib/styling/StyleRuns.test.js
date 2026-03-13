import { describe, it, expect } from "vitest";
import { Style } from "../Style.js";
import { Color } from "../Color.js";
import { StyleRuns } from "./StyleRuns.js";

const STYLE_RED = new Style({
  stroke: Color.RED,
});
const STYLE_GREEN = new Style({
  stroke: Color.RED,
});
const STYLE_BLUE = new Style({
  stroke: Color.RED,
});

describe("StyleRuns", () => {
  describe("iter", () => {
    it("with no runs returns empty generator", () => {
      const runs = new StyleRuns([]);

      const result = runs.iter().toArray();

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with runs computes correct start and end indices", () => {
      const runs = new StyleRuns([
        [3, STYLE_RED],
        [1, STYLE_GREEN],
        [3, STYLE_BLUE],
      ]);

      const result = runs.iter().toArray();

      const expected = [
        [0, 3, STYLE_RED],
        [3, 4, STYLE_GREEN],
        [4, 7, STYLE_BLUE],
      ];
      expect(result).toEqual(expected);
    });
  });

  it("from_styles creates runs of length 1", () => {
    const styles = [STYLE_RED, STYLE_GREEN, STYLE_BLUE, STYLE_GREEN];

    const result = StyleRuns.from_styles(styles);

    const expected = new StyleRuns([
      [1, STYLE_RED],
      [1, STYLE_GREEN],
      [1, STYLE_BLUE],
      [1, STYLE_GREEN],
    ]);
    expect(result).toEqual(expected);
  });
});
