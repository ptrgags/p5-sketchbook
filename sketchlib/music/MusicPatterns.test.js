import { describe, it, expect } from "vitest";
import { PatternGrid } from "./PatternGrid.js";
import { B4, C4, E4, G4 } from "./pitches.js";
import { N2, N4 } from "./durations.js";
import { Velocity } from "./Velocity.js";
import { MusicPatterns } from "./MusicPatterns.js";
import { make_note, Melody, Note, Rest } from "./Music.js";
import { Rhythm } from "./Rhythm.js";

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
});
