import { describe, it, expect } from "vitest";
import { PatternGrid } from "./PatternGrid.js";
import { B4, C4, C5, D4, D5, E4, E5, F4, F5, G4 } from "./pitches.js";
import { N2, N4, N8 } from "./durations.js";
import { Velocity } from "./Velocity.js";
import { MusicPatterns } from "./MusicPatterns.js";
import { make_note, Melody, Note, Rest } from "./Music.js";
import { Rhythm } from "./Rhythm.js";
import { MAJOR_SCALE } from "./scales.js";
import { Rational } from "../Rational.js";

describe("MusicPatterns", () => {
  describe("make_notes", () => {
    it("with empty pitches returns empty grid", () => {
      const pitches = PatternGrid.empty();

      const result = MusicPatterns.make_notes(pitches);

      expect(result).toEqual(PatternGrid.empty());
    });

    it("with velocities spanning a different duration throws error", () => {
      const pitches = new PatternGrid([C4, E4, G4, B4], N4);
      // Oops, only 3/4 of a measure long!
      const velocities = new PatternGrid(
        [Velocity.P, Velocity.F, Velocity.FF],
        N4,
      );

      expect(() => {
        return MusicPatterns.make_notes(pitches, velocities);
      }).toThrowError("grids must have the same duration in time");
    });

    it("with no velocities makes notes at default velocity", () => {
      const pitches = new PatternGrid([C4, E4, G4, B4], N4);

      const result = MusicPatterns.make_notes(pitches);

      const expected = new PatternGrid(
        [new Note(C4), new Note(E4), new Note(G4), new Note(B4)],
        N4,
      );
      expect(result).toEqual(expected);
    });

    it("with pitch as flat array makes pattern in quarter notes", () => {
      const pitches = [C4, E4, G4, B4];

      const result = MusicPatterns.make_notes(pitches);

      const expected = new PatternGrid(
        [new Note(C4), new Note(E4), new Note(G4), new Note(B4)],
        N4,
      );
      expect(result).toEqual(expected);
    });

    it("with pitches and velocities of the same shape makes notes", () => {
      const pitches = new PatternGrid([C4, E4, G4], N4);
      const velocities = new PatternGrid(
        [Velocity.P, Velocity.MF, Velocity.FF],
        N4,
      );

      const result = MusicPatterns.make_notes(pitches, velocities);

      const expected = new PatternGrid(
        [
          new Note(C4, Velocity.P),
          new Note(E4, Velocity.MF),
          new Note(G4, Velocity.FF),
        ],
        N4,
      );
      expect(result).toEqual(expected);
    });

    it("with pitches as flat array matches duration of velocities", () => {
      const pitches = [C4, E4, G4, B4];
      const velocities = new PatternGrid(
        [Velocity.PP, Velocity.P, Velocity.F, Velocity.FF],
        N8,
      );

      const result = MusicPatterns.make_notes(pitches, velocities);

      const expected = new PatternGrid(
        [
          new Note(C4, Velocity.PP),
          new Note(E4, Velocity.P),
          new Note(G4, Velocity.F),
          new Note(B4, Velocity.FF),
        ],
        N8,
      );
      expect(result).toEqual(expected);
    });

    it("with velocity as flat array matches duration of pitches", () => {
      const pitches = new PatternGrid([C4, E4, G4, B4], N8);
      const velocities = [Velocity.PP, Velocity.P, Velocity.F, Velocity.FF];

      const result = MusicPatterns.make_notes(pitches, velocities);

      const expected = new PatternGrid(
        [
          new Note(C4, Velocity.PP),
          new Note(E4, Velocity.P),
          new Note(G4, Velocity.F),
          new Note(B4, Velocity.FF),
        ],
        N8,
      );
      expect(result).toEqual(expected);
    });

    it("with velocities at different step size but same duration produces correct notes", () => {
      const pitches = new PatternGrid([C4, E4, G4, B4], N4);
      const velocities = new PatternGrid([Velocity.MP, Velocity.F], N2);

      const result = MusicPatterns.make_notes(pitches, velocities);

      const expected = new PatternGrid(
        [
          new Note(C4, Velocity.MP),
          new Note(E4, Velocity.MP),
          new Note(G4, Velocity.F),
          new Note(B4, Velocity.F),
        ],
        N4,
      );
      expect(result).toEqual(expected);
    });

    it("with pitches and velocities as flat arrays assumes quarter notes", () => {
      const pitches = [C4, E4, G4, B4];
      const velocities = [Velocity.PP, Velocity.P, Velocity.F, Velocity.FF];

      const result = MusicPatterns.make_notes(pitches, velocities);

      const expected = new PatternGrid(
        [
          new Note(C4, Velocity.PP),
          new Note(E4, Velocity.P),
          new Note(G4, Velocity.F),
          new Note(B4, Velocity.FF),
        ],
        N4,
      );
      expect(result).toEqual(expected);
    });
  });

  describe("melody", () => {
    it("with rhythm and pitch array makes melody", () => {
      const rhythm = new Rhythm("x.x.", N4);
      const pitches = [C4, E4];

      const result = MusicPatterns.melody(rhythm, pitches);

      const expected = new Melody(
        make_note(C4, N4),
        new Rest(N4),
        make_note(E4, N4),
        new Rest(N4),
      );
      expect(result).toEqual(expected);
    });

    it("with velocity array sets correct velocities", () => {
      const rhythm = new Rhythm("x.x.", N4);
      const pitches = [C4, E4];
      const velocities = [Velocity.MP, Velocity.FF];

      const result = MusicPatterns.melody(rhythm, pitches, velocities);

      const expected = new Melody(
        make_note(C4, N4, Velocity.MP),
        new Rest(N4),
        make_note(E4, N4, Velocity.FF),
        new Rest(N4),
      );
      expect(result).toEqual(expected);
    });
  });

  describe("scale_melody", () => {
    it("creates melody based on rhythm and scale degrees", () => {
      const rhythm = new Rhythm("xxxxxxxx|x--.x--.", N8);
      const scale = MAJOR_SCALE.to_scale(C4);
      const degrees = [0, 1, 2, 3, 7, 8, 9, 10, 0, 7];

      const result = MusicPatterns.scale_melody(rhythm, scale, degrees);

      const expected = new Melody(
        make_note(C4, N8),
        make_note(D4, N8),
        make_note(E4, N8),
        make_note(F4, N8),
        make_note(C5, N8),
        make_note(D5, N8),
        make_note(E5, N8),
        make_note(F5, N8),
        make_note(C4, new Rational(3, 8)),
        new Rest(N8),
        make_note(C5, new Rational(3, 8)),
        new Rest(N8),
      );
      expect(result).toEqual(expected);
    });

    it("with velocities merges grids", () => {
      const rhythm = new Rhythm("xxxxxxxx|x--.x--.", N8);
      const scale = MAJOR_SCALE.to_scale(C4);
      const degrees = [0, 1, 2, 3, 7, 8, 9, 10, 0, 7];
      const velocities = [
        Velocity.P,
        Velocity.P,
        Velocity.P,
        Velocity.P,
        Velocity.MP,
        Velocity.MP,
        Velocity.MP,
        Velocity.MP,
        Velocity.MF,
        Velocity.F,
      ];

      const result = MusicPatterns.scale_melody(
        rhythm,
        scale,
        degrees,
        velocities,
      );

      const expected = new Melody(
        make_note(C4, N8, Velocity.P),
        make_note(D4, N8, Velocity.P),
        make_note(E4, N8, Velocity.P),
        make_note(F4, N8, Velocity.P),
        make_note(C5, N8, Velocity.MP),
        make_note(D5, N8, Velocity.MP),
        make_note(E5, N8, Velocity.MP),
        make_note(F5, N8, Velocity.MP),
        make_note(C4, new Rational(3, 8), Velocity.MF),
        new Rest(N8),
        make_note(C5, new Rational(3, 8), Velocity.F),
        new Rest(N8),
      );
      expect(result).toEqual(expected);
    });
  });
});
