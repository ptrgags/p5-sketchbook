import { describe, it, expect } from "vitest";
import { PatternGrid } from "./PatternGrid.js";
import { N16, N4, N8 } from "./durations.js";
import { RhythmStep } from "./RhythmStep.js";
import { C4, C5, E4, F4, F5, G4 } from "./pitches.js";
import { Velocity } from "./Velocity.js";
import { Melody, Note, Rest } from "./Music.js";
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

  describe("zip and unzip", () => {
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

    it("zip with velocity produces a melody with all notes at mezzo-forte", () => {
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

  describe("overlay and split", () => {});
});
