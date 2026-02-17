import { describe, it, expect } from "vitest";
import { Rhythm } from "./Rhythm.js";
import { N16, N2, N2T, N4, N8 } from "./durations.js";
import { RhythmStep } from "./RhythmStep.js";
import { PatternGrid } from "./PatternGrid.js";
import { Gap, Parallel, Sequential, TimeInterval } from "./Timeline.js";
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

  describe("unzip", () => {
    it("with parallel timeline music throws", () => {
      const parallel = new Sequential(
        new TimeInterval(1, N4),
        new TimeInterval(2, N4),
        new TimeInterval(3, N4),
      );

      expect(() => {
        return Rhythm.unzip(parallel);
      }).toThrowError("unzip is only defined for single-lane timelines");
    });

    it("with empty melody produces empty grids", () => {
      const empty = Gap.ZERO;

      const result = Rhythm.unzip(empty);

      const expected = {
        rhythm: Rhythm.EMPTY,
        values: PatternGrid.empty(),
      };
      expect(result).toEqual(expected);
    });

    it("with quarter note timeline correct grids", () => {
      const melody = new Parallel(
        new TimeInterval(1, N4),
        new TimeInterval(2, N4),
        new Gap(N4),
        new TimeInterval(3, N4),
      );

      const result = Rhythm.unzip(melody);
      const expected = {
        rhythm: new Rhythm("xx.x", N4),
        values: new PatternGrid([1, 2, 3], N4),
      };

      expect(result).toEqual(expected);
    });

    it("with complex rhythm produces correct grids", () => {
      const melody = new Parallel(
        new TimeInterval(1, N2),
        new TimeInterval(2, N4),
        new TimeInterval(3, N8),
        new Gap(N4),
        new TimeInterval(4, N8),
        new TimeInterval(5, N16),
        new Gap(N4),
        new TimeInterval(6, new Rational(3, 8)),
      );

      const result = Rhythm.unzip(melody);

      const expected = {
        rhythm: new Rhythm("x-------|x---x-..|..x-x...|.x-----.", N16),
        values: new PatternGrid([1, 2, 3, 4, 5, 6], N16),
      };
      expect(result).toEqual(expected);
    });
  });

  describe("overlay", () => {
    it("with different array lengths throws", () => {
      const rhythm = new Rhythm("x.xx.x--", N8);
      const values = new PatternGrid([1, 2, 3, 4, 5, 6, 7, 8], N8);

      expect(() => {
        return rhythm.overlay(values);
      }).toThrowError("grid sizes must match");
    });

    it("with different number of velocities throws", () => {
      const rhythm = new Rhythm("x.xx.x--", N8);
      const values = new PatternGrid([1, 2, 3, 4, 5, 6, 7, 8], N8);
      expect(() => {
        return rhythm.overlay(values);
      }).toThrowError("grid sizes must match");
    });

    it("with different pitch step size throws", () => {
      const rhythm = new Rhythm("x.xx.x--", N8);
      const values = new PatternGrid([1, 2, 3, 4, 5, 6, 7, 8], N16);
      expect(() => {
        return rhythm.overlay(values);
      }).toThrowError("grid sizes must match");
    });

    it("with values creates a timeline", () => {
      const rhythm = new Rhythm("x.xx.x--", N8);
      const values = new PatternGrid([1, 2, 3, 4, 5, 6, 7, 8], N8);

      const result = rhythm.overlay(values);

      const expected = new Sequential(
        new TimeInterval(1, N8),
        new Gap(N8),
        new TimeInterval(3, N8),
        new TimeInterval(4, N8),
        new Gap(N8),
        new TimeInterval(6, new Rational(3, 8)),
      );
      expect(result).toEqual(expected);
    });
  });

  describe("deoverlay", () => {
    it("with polyphonic pattern throws", () => {
      const poly = new Parallel(
        new TimeInterval(1, N4),
        new TimeInterval(2, N4),
        new TimeInterval(3, N4),
      );

      expect(() => {
        return Rhythm.deoverlay(poly);
      }).toThrowError("deoverlay is only defined for single-lane timelines");
    });

    it("with empty melody produces empty grids", () => {
      const empty = Gap.ZERO;

      const result = Rhythm.deoverlay(empty);

      const expected = {
        rhythm: PatternGrid.empty(),
        pitch: PatternGrid.empty(),
        velocity: PatternGrid.empty(),
      };
      expect(result).toEqual(expected);
    });

    it("with quarter note pattern produces correct grids", () => {
      const timeline = new Sequential(
        new TimeInterval(1, N4),
        new TimeInterval(2, N4),
        new Gap(N4),
        new TimeInterval(3, N4),
      );

      const result = Rhythm.deoverlay(timeline);

      const expected = {
        rhythm: new Rhythm("xx.x", N4),
        pitch: new PatternGrid([1, 2, undefined, 3], N4),
      };
      expect(result).toEqual(expected);
    });

    it("with complex rhythm produces correct grids", () => {
      const melody = new Sequential(
        new TimeInterval(1, N2),
        new TimeInterval(2, N4),
        new TimeInterval(3, N8),
        new Gap(N4),
        new TimeInterval(4, N8),
        new TimeInterval(5, N16),
        new Gap(N4),
        new TimeInterval(6, new Rational(3, 8)),
      );

      const result = Rhythm.deoverlay(melody);

      const expected = {
        rhythm: new Rhythm("x-------|x---x-..|..x-x...|.x-----.", N16),
        values: new PatternGrid(
          [
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            2,
            2,
            2,
            2,
            3,
            3,
            undefined,
            undefined,
            undefined,
            undefined,
            4,
            4,
            4,
            undefined,
            undefined,
            undefined,
            undefined,
            5,
            5,
            5,
            5,
            5,
            5,
          ],
          N16,
        ),
      };
      expect(result).toEqual(expected);
    });
  });
});
