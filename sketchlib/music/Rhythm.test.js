import { describe, it, expect } from "vitest";
import { Rhythm } from "./Rhythm.js";
import { N2T, N4, N8 } from "./durations.js";
import { RhythmStep } from "./RhythmStep.js";
import { PatternGrid } from "./PatternGrid.js";
import { Gap, Sequential, TimeInterval } from "./Timeline.js";
import { Rational } from "../Rational.js";

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

  describe("zip", () => {
    it("zip with empty grids produces empty timeline", () => {
      const rhythm = Rhythm.EMPTY;
      const values = [];

      const result = rhythm.zip(values);

      expect(result).toEqual(Gap.ZERO);
    });

    it("with not enough values throws error", () => {
      const rhythm = new Rhythm("xxxxxxxx", N8);
      const values = [1, 2, 3];

      expect(() => {
        return rhythm.zip(values);
      }).toThrowError("rhythm needs at least 8 values, got 3");
    });

    it("with more values than needed ignores extras", () => {
      const rhythm = new Rhythm("x..x...x", N8);
      const values = [1, 2, 3, 4, 5, 6, 7, 8];

      const result = rhythm.zip(values);

      const expected = new Sequential(
        new TimeInterval(1, N8),
        new Gap(N4),
        new TimeInterval(2, N8),
        new Gap(new Rational(3, 8)),
        new TimeInterval(3, N8),
      );
      expect(result).toEqual(expected);
    });

    it("with more values than needed ignores extras", () => {
      const rhythm = new Rhythm("x..x...x", N8);
      const values = [1, 2, 3, 4, 5, 6, 7, 8];

      const result = rhythm.zip(values);

      const expected = new Sequential(
        new TimeInterval(1, N8),
        new Gap(N4),
        new TimeInterval(2, N8),
        new Gap(new Rational(3, 8)),
        new TimeInterval(3, N8),
      );
      expect(result).toEqual(expected);
    });

    it("with values PatternGrid ignores duration", () => {
      const rhythm = new Rhythm("xx.x", N4);
      const values = new PatternGrid([1, 2, 3], N2T);

      const result = rhythm.zip(values);

      const expected = new Sequential(
        new TimeInterval(1, N4),
        new TimeInterval(2, N4),
        new Gap(N4),
        new TimeInterval(3, N4),
      );
      expect(result).toEqual(expected);
    });
  });
});
