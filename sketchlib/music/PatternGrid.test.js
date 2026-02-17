import { describe, it, expect } from "vitest";
import { PatternGrid } from "./PatternGrid.js";
import { N1, N16, N2, N2T, N4, N8, N8T } from "./durations.js";
import { RhythmStep } from "./RhythmStep.js";
import { A4, B4, C3, C4, C5, D4, E4, F4, F5, G3, G4 } from "./pitches.js";
import { Velocity } from "./Velocity.js";
import { Harmony, make_note, Melody, Note, Rest } from "./Music.js";
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

  describe("overlay", () => {
    it("with different array lengths throws", () => {
      const rhythm = PatternGrid.rhythm("x.xx.x--", N8);
      const pitches = new PatternGrid([C4, D4, E4, F4, G4, A4, B4], N8);

      expect(() => {
        return PatternGrid.overlay(rhythm, pitches);
      }).toThrowError("grid sizes must match");
    });

    it("with different number of velocities throws", () => {
      const rhythm = PatternGrid.rhythm("x.xx.x--", N8);
      const pitches = new PatternGrid([C4, D4, E4, F4, G4, A4, B4, C5], N8);
      const velocities = new PatternGrid(new Array(7).fill(Velocity.F), N8);
      expect(() => {
        return PatternGrid.overlay(rhythm, pitches, velocities);
      }).toThrowError("grid sizes must match");
    });

    it("with different pitch step size throws", () => {
      const rhythm = PatternGrid.rhythm("x.xx.x--", N8);
      const pitches = new PatternGrid([C4, D4, E4, F4, G4, A4, B4, C5], N16);
      expect(() => {
        return PatternGrid.overlay(rhythm, pitches);
      }).toThrowError("grid sizes must match");
    });

    it("with different number of velocities throws", () => {
      const rhythm = PatternGrid.rhythm("x.xx.x--", N8);
      const pitches = new PatternGrid([C4, D4, E4, F4, G4, A4, B4, C5], N8);
      const velocities = new PatternGrid(new Array(8).fill(Velocity.F), N16);
      expect(() => {
        return PatternGrid.overlay(rhythm, pitches, velocities);
      }).toThrowError("grid sizes must match");
    });

    it("without velocity produces a melody with all notes at mezzo-forte", () => {
      const rhythm = PatternGrid.rhythm("x.xx.x--", N8);
      const pitches = new PatternGrid([C4, D4, E4, F4, G4, A4, B4, C5], N8);

      const result = PatternGrid.overlay(rhythm, pitches);

      const expected = new Melody(
        make_note(C4, N8),
        new Rest(N8),
        make_note(E4, N8),
        make_note(F4, N8),
        new Rest(N8),
        make_note(A4, new Rational(3, 8)),
      );
      expect(result).toEqual(expected);
    });

    it("with velocity produces a melody with correct velocities", () => {
      const rhythm = PatternGrid.rhythm("x.xx.x--", N8);
      const pitches = new PatternGrid([C4, D4, E4, F4, G4, A4, B4, C5], N8);
      const f = Velocity.F;
      const p = Velocity.P;
      const velocities = new PatternGrid([f, f, f, f, p, p, p, p], N8);

      const result = PatternGrid.overlay(rhythm, pitches, velocities);

      const expected = new Melody(
        make_note(C4, N8, f),
        new Rest(N8),
        make_note(E4, N8, f),
        make_note(F4, N8, f),
        new Rest(N8),
        make_note(A4, new Rational(3, 8), p),
      );
      expect(result).toEqual(expected);
    });
  });

  describe("deoverlay", () => {
    it("with polyphonic music throws", () => {
      const chord = new Harmony(
        make_note(G4, N4),
        make_note(E4, N4),
        make_note(C4, N4),
      );

      expect(() => {
        return PatternGrid.deoverlay(chord);
      }).toThrowError("unzip is only defined for monophonic melodies");
    });

    it("with empty melody produces empty grids", () => {
      const empty = Rest.ZERO;

      const result = PatternGrid.deoverlay(empty);

      const expected = {
        rhythm: PatternGrid.empty(),
        pitch: PatternGrid.empty(),
        velocity: PatternGrid.empty(),
      };
      expect(result).toEqual(expected);
    });

    it("with quarter note melody produces correct grids", () => {
      const melody = new Melody(
        make_note(C4, N4, Velocity.P),
        make_note(E4, N4, Velocity.F),
        new Rest(N4),
        make_note(G4, N4, Velocity.FFF),
      );

      const result = PatternGrid.deoverlay(melody);

      const expected = {
        rhythm: PatternGrid.rhythm("xx.x", N4),
        pitch: new PatternGrid([C4, E4, undefined, G4], N4),
        velocity: new PatternGrid(
          [Velocity.P, Velocity.F, undefined, Velocity.FFF],
          N4,
        ),
      };
      expect(result).toEqual(expected);
    });

    it("with complex rhythm produces correct grids", () => {
      const melody = new Melody(
        make_note(C4, N2, Velocity.P),
        make_note(E4, N4, Velocity.F),
        make_note(C3, N8),
        new Rest(N4),
        make_note(G3, N8),
        make_note(C3, N16),
        new Rest(N4),
        make_note(G4, new Rational(3, 8), Velocity.FFF),
      );

      const result = PatternGrid.deoverlay(melody);

      const p = Velocity.P;
      const f = Velocity.F;
      const mf = Velocity.MF;
      const fff = Velocity.FFF;
      const expected = {
        rhythm: PatternGrid.rhythm("x-------x---x-....x-x....x-----", N16),
        pitch: new PatternGrid(
          [
            C4,
            C4,
            C4,
            C4,
            C4,
            C4,
            C4,
            C4,
            E4,
            E4,
            E4,
            E4,
            C3,
            C3,
            undefined,
            undefined,
            undefined,
            undefined,
            G3,
            G3,
            C3,
            undefined,
            undefined,
            undefined,
            undefined,
            G4,
            G4,
            G4,
            G4,
            G4,
            G4,
          ],
          N16,
        ),
        velocity: new PatternGrid(
          [
            // first note
            p,
            p,
            p,
            p,
            p,
            p,
            p,
            p,
            // second note
            f,
            f,
            f,
            f,
            // third note
            mf,
            mf,
            // first rest
            undefined,
            undefined,
            undefined,
            undefined,
            // fourth note
            mf,
            mf,
            // fifth note
            mf,
            // second rest
            undefined,
            undefined,
            undefined,
            undefined,
            // sixth note
            fff,
            fff,
            fff,
            fff,
            fff,
            fff,
          ],
          N16,
        ),
      };
      expect(result).toEqual(expected);
    });
  });
});
