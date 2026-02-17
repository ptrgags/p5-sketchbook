import { describe, it, expect } from "vitest";
import { Rhythm } from "./Rhythm.js";
import { N4, N8 } from "./durations.js";
import { RhythmStep } from "./RhythmStep.js";
import { PatternGrid } from "./PatternGrid.js";

describe("Rhythm", () => {
  describe("constructor", () => {
    it("with bad characters throws error", () => {
      expect(() => {
        return new Rhythm("boots&cats", N4);
      }).toThrowError("invalid rhythm");
    });

    it("spaces and pipes are treated as comments", () => {
      const result = new Rhythm("x.x-|x x x x|x--x", N4).pattern;

      const expected = new PatternGrid(
        [
          RhythmStep.HIT,
          RhythmStep.REST,
          RhythmStep.HIT,
          RhythmStep.SUSTAIN,
          // measure 2
          RhythmStep.HIT,
          RhythmStep.HIT,
          RhythmStep.HIT,
          RhythmStep.HIT,
          // measure 3
          RhythmStep.HIT,
          RhythmStep.SUSTAIN,
          RhythmStep.SUSTAIN,
          RhythmStep.HIT,
        ],
        N4,
      );
      expect(result).toEqual(expected);
    });

    it("with valid rhythm string computes correct grid", () => {
      const result = new Rhythm("x.x-x..x", N8).pattern;

      const expected = new PatternGrid(
        [
          RhythmStep.HIT,
          RhythmStep.REST,
          RhythmStep.HIT,
          RhythmStep.SUSTAIN,
          RhythmStep.HIT,
          RhythmStep.REST,
          RhythmStep.REST,
          RhythmStep.HIT,
        ],
        N8,
      );
      expect(result).toEqual(expected);
    });
  });
});
