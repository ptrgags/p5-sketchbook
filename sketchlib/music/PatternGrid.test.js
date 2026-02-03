import { describe, it, expect } from "vitest";
import { PatternGrid } from "./PatternGrid.js";
import { N1, N16, N2, N4, N8 } from "./durations.js";
import { RhythmStep } from "./RhythmStep.js";
import { A4, B4, C3, C4, C5, D4, E4, F4, F5, G3, G4 } from "./pitches.js";
import { Velocity } from "./Velocity.js";
import { Harmony, Melody, Note, Rest } from "./Music.js";
import { Rational } from "../Rational.js";

describe("PatternGrid", () => {
  describe("rhythm constructor", () => {
    it("with bad characters throws error", () => {
      expect(() => {
        return PatternGrid.rhythm("boots and cats", N4);
      }).toThrowError("invalid rhythm");
    });

    it("with valid rhythm string computes correct grid", () => {
      const result = PatternGrid.rhythm("x.x-x..x", N8);

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
    it("zip with different number of pitches and velocities throws", () => {
      const rhythm = PatternGrid.rhythm("x.x.x.x.", N8);
      const pitches = new PatternGrid([C4, E4, G4, C5], N4);
      const velocities = new PatternGrid(
        [Velocity.MF, Velocity.F, Velocity.FFF],
        N4,
      );

      expect(() => {
        return PatternGrid.zip(rhythm, pitches, velocities);
      }).toThrowError("pitches and velocities must have the same length");
    });

    it("zip with empty grids produces empty timeline", () => {
      const rhythm = PatternGrid.empty();
      const pitches = PatternGrid.empty();
      const velocities = PatternGrid.empty();

      const result = PatternGrid.zip(rhythm, pitches, velocities);
      expect(result).toEqual(Rest.ZERO);
    });

    it("zip without velocity produces a melody with all notes at mezzo-forte", () => {
      const rhythm = PatternGrid.rhythm("x.x--.x-x..xx.x.", N16);
      const pitches = new PatternGrid([C4, G4, C4, E4, F4, G4, C5], N8);

      const result = PatternGrid.zip(rhythm, pitches);

      const expected = new Melody(
        new Note(C4, N16),
        new Rest(N16),
        new Note(G4, new Rational(3, 16)),
        new Rest(N16),
        new Note(C4, N8),
        new Note(E4, N16),
        new Rest(N8),
        new Note(F4, N16),
        new Note(G4, N16),
        new Rest(N16),
        new Note(C5, N16),
        new Rest(N16),
      );
      expect(result).toEqual(expected);
    });

    it("zip with velocity produces a melody with correct velocities", () => {
      const rhythm = PatternGrid.rhythm("x.x--.x-x..xx.x.", N16);
      const pitches = new PatternGrid([C4, G4, C4, E4, F4, G4, C5], N8);
      const velocities = new PatternGrid(
        [
          Velocity.P,
          Velocity.F,
          Velocity.P,
          Velocity.F,
          Velocity.P,
          Velocity.F,
          Velocity.P,
        ],
        N8,
      );

      const result = PatternGrid.zip(rhythm, pitches, velocities);

      const expected = new Melody(
        new Note(C4, N16, Velocity.P),
        new Rest(N16),
        new Note(G4, new Rational(3, 16), Velocity.F),
        new Rest(N16),
        new Note(C4, N8, Velocity.P),
        new Note(E4, N16, Velocity.F),
        new Rest(N8),
        new Note(F4, N16, Velocity.P),
        new Note(G4, N16, Velocity.F),
        new Rest(N16),
        new Note(C5, N16, Velocity.P),
        new Rest(N16),
      );
      expect(result).toEqual(expected);
    });

    it("zip with extra pitch and velocity values ignores extra values", () => {
      const rhythm = PatternGrid.rhythm("x.x--.x-x..xx.x.", N16);
      const pitches = new PatternGrid(
        [C4, G4, C4, E4, F4, G4, C5, F5, F5, F5],
        N8,
      );
      const velocities = new PatternGrid(
        [
          Velocity.P,
          Velocity.F,
          Velocity.P,
          Velocity.F,
          Velocity.P,
          Velocity.F,
          Velocity.P,
          Velocity.F,
          Velocity.P,
          Velocity.F,
        ],
        N8,
      );

      const result = PatternGrid.zip(rhythm, pitches, velocities);

      const expected = new Melody(
        new Note(C4, N16, Velocity.P),
        new Rest(N16),
        new Note(G4, new Rational(3, 16), Velocity.F),
        new Rest(N16),
        new Note(C4, N8, Velocity.P),
        new Note(E4, N16, Velocity.F),
        new Rest(N8),
        new Note(F4, N16, Velocity.P),
        new Note(G4, N16, Velocity.F),
        new Rest(N16),
        new Note(C5, N16, Velocity.P),
        new Rest(N16),
      );
      expect(result).toEqual(expected);
    });
  });

  describe("unzip", () => {
    it("with polyphonic music throws", () => {
      const chord = new Harmony(
        new Note(G4, N4),
        new Note(E4, N4),
        new Note(C4, N4),
      );

      expect(() => {
        return PatternGrid.unzip(chord);
      }).toThrowError("unzip is only defined for monophonic melodies");
    });

    it("with empty melody produces empty grids", () => {
      const empty = Rest.ZERO;

      const result = PatternGrid.unzip(empty);

      const expected = {
        rhythm: PatternGrid.empty(),
        pitch: PatternGrid.empty(),
        velocity: PatternGrid.empty(),
      };
      expect(result).toEqual(expected);
    });

    it("with quarter note melody produces correct grids", () => {
      const melody = new Melody(
        new Note(C4, N4, Velocity.P),
        new Note(E4, N4, Velocity.F),
        new Rest(N4),
        new Note(G4, N4, Velocity.FFF),
      );

      const result = PatternGrid.unzip(melody);
      const expected = {
        rhythm: PatternGrid.rhythm("xx.x", N4),
        pitch: new PatternGrid([C4, E4, G4], N4),
        velocity: new PatternGrid([Velocity.P, Velocity.F, Velocity.FFF], N4),
      };

      expect(result).toEqual(expected);
    });

    it("with complex rhythm produces correct grids", () => {
      const melody = new Melody(
        new Note(C4, N2, Velocity.P),
        new Note(E4, N4, Velocity.F),
        new Note(C3, N8),
        new Rest(N4),
        new Note(G3, N8),
        new Note(C3, N16),
        new Rest(N4),
        new Note(G4, new Rational(3, 8), Velocity.FFF),
      );

      const result = PatternGrid.unzip(melody);

      const expected = {
        rhythm: PatternGrid.rhythm("x-------x---x-....x-x....x-----", N16),
        pitch: new PatternGrid([C4, E4, C3, G3, C3, G4], N16),
        velocity: new PatternGrid(
          [
            Velocity.P,
            Velocity.F,
            Velocity.MF,
            Velocity.MF,
            Velocity.MF,
            Velocity.FFF,
          ],
          N16,
        ),
      };
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
        new Note(C4, N8),
        new Rest(N8),
        new Note(E4, N8),
        new Note(F4, N8),
        new Rest(N8),
        new Note(A4, new Rational(3, 8)),
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
        new Note(C4, N8, f),
        new Rest(N8),
        new Note(E4, N8, f),
        new Note(F4, N8, f),
        new Rest(N8),
        new Note(A4, new Rational(3, 8), p),
      );
      expect(result).toEqual(expected);
    });
  });

  describe("deoverlay", () => {
    it("with polyphonic music throws", () => {
      const chord = new Harmony(
        new Note(G4, N4),
        new Note(E4, N4),
        new Note(C4, N4),
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
        new Note(C4, N4, Velocity.P),
        new Note(E4, N4, Velocity.F),
        new Rest(N4),
        new Note(G4, N4, Velocity.FFF),
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
        new Note(C4, N2, Velocity.P),
        new Note(E4, N4, Velocity.F),
        new Note(C3, N8),
        new Rest(N4),
        new Note(G3, N8),
        new Note(C3, N16),
        new Rest(N4),
        new Note(G4, new Rational(3, 8), Velocity.FFF),
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
