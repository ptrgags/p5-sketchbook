import { describe, it, expect } from "vitest";
import { PatternGrid } from "./PatternGrid.js";
import {
  A4,
  B4,
  C3,
  C4,
  C5,
  D4,
  D5,
  E3,
  E4,
  E5,
  F4,
  F5,
  G3,
  G4,
  REST,
} from "./pitches.js";
import { N1, N2, N4, N8 } from "./durations.js";
import { Velocity } from "./Velocity.js";
import { MusicPatterns } from "./MusicPatterns.js";
import { Harmony, make_note, Melody, Note, Rest } from "./Music.js";
import { Rhythm } from "./Rhythm.js";
import { MAJOR_SCALE } from "./scales.js";
import { Rational } from "../Rational.js";
import { MAJOR_TRIAD, MINOR7, MINOR_TRIAD } from "./chords.js";

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

  describe("voice_lead", () => {
    it("constructs timeline from parallel patterns", () => {
      const waltz_rhythm = new Rhythm("xxx|xxx", N4);
      const I_IV = new PatternGrid(
        [MAJOR_TRIAD.to_chord(C4), MAJOR_TRIAD.to_chord(F4)],
        new Rational(3, 4),
      );
      // waltz rhythm
      const indices = new PatternGrid(
        [
          [0, REST, REST],
          [REST, 1, 2],
          [REST, 1, 2],
          [0, REST, REST],
          [REST, 1, 2],
          [REST, 1, 2],
        ],
        N4,
      );

      const result = MusicPatterns.voice_lead(waltz_rhythm, I_IV, indices);

      const expected = new Melody(
        new Harmony(new Rest(N4), new Rest(N4), make_note(C4, N4)),
        new Harmony(make_note(G4, N4), make_note(E4, N4), new Rest(N4)),
        new Harmony(make_note(G4, N4), make_note(E4, N4), new Rest(N4)),
        new Harmony(new Rest(N4), new Rest(N4), make_note(F4, N4)),
        new Harmony(make_note(C5, N4), make_note(A4, N4), new Rest(N4)),
        new Harmony(make_note(C5, N4), make_note(A4, N4), new Rest(N4)),
      );
      expect(result).toEqual(expected);
    });

    it("with velocity sets the note velocity", () => {
      const waltz_rhythm = new Rhythm("xxx|xxx", N4);
      const I_IV = new PatternGrid(
        [MAJOR_TRIAD.to_chord(C4), MAJOR_TRIAD.to_chord(F4)],
        new Rational(3, 4),
      );
      const indices = new PatternGrid(
        [
          [0, REST, REST],
          [REST, 1, 2],
          [REST, 1, 2],
          [0, REST, REST],
          [REST, 1, 2],
          [REST, 1, 2],
        ],
        N4,
      );
      const p = Velocity.P;
      const f = Velocity.F;
      const velocities = new PatternGrid([p, f], new Rational(3, 4));

      const result = MusicPatterns.voice_lead(
        waltz_rhythm,
        I_IV,
        indices,
        velocities,
      );

      const expected = new Melody(
        new Harmony(new Rest(N4), new Rest(N4), make_note(C4, N4, p)),
        new Harmony(make_note(G4, N4, p), make_note(E4, N4, p), new Rest(N4)),
        new Harmony(make_note(G4, N4, p), make_note(E4, N4, p), new Rest(N4)),
        new Harmony(new Rest(N4), new Rest(N4), make_note(F4, N4, f)),
        new Harmony(make_note(C5, N4, f), make_note(A4, N4, f), new Rest(N4)),
        new Harmony(make_note(C5, N4, f), make_note(A4, N4, f), new Rest(N4)),
      );
      expect(result).toEqual(expected);
    });
  });

  describe("block_chords", () => {
    it("voices chords in closed position", () => {
      const rhythm = new Rhythm("xx", N1);
      const chords = new PatternGrid(
        [MAJOR_TRIAD.to_chord(C4), MINOR7.to_chord(E4)],
        N1,
      );

      const result = MusicPatterns.block_chords(rhythm, chords);

      const expected = new Melody(
        new Harmony(make_note(G4, N1), make_note(E4, N1), make_note(C4, N1)),
        new Harmony(
          make_note(D5, N1),
          make_note(B4, N1),
          make_note(G4, N1),
          make_note(E4, N1),
        ),
      );
      expect(result).toEqual(expected);
    });

    it("with transpose can transpose and invert chords", () => {
      const rhythm = new Rhythm("xx", N1);
      const chords = new PatternGrid(
        [MAJOR_TRIAD.to_chord(C4), MINOR7.to_chord(E4)],
        N1,
      );
      const transpose = new PatternGrid([-3, -1], N1);

      const result = MusicPatterns.block_chords(rhythm, chords, transpose);

      const expected = new Melody(
        new Harmony(make_note(G3, N1), make_note(E3, N1), make_note(C3, N1)),
        new Harmony(
          make_note(B4, N1),
          make_note(G4, N1),
          make_note(E4, N1),
          make_note(D4, N1),
        ),
      );
      expect(result).toEqual(expected);
    });

    it("with velocities sets note velocity", () => {
      const rhythm = new Rhythm("xx", N1);
      const chords = new PatternGrid(
        [MAJOR_TRIAD.to_chord(C4), MINOR7.to_chord(E4)],
        N1,
      );
      const f = Velocity.F;
      const velocities = new PatternGrid([f], rhythm.duration);

      const result = MusicPatterns.block_chords(
        rhythm,
        chords,
        undefined,
        velocities,
      );

      const expected = new Melody(
        new Harmony(
          make_note(G4, N1, f),
          make_note(E4, N1, f),
          make_note(C4, N1, f),
        ),
        new Harmony(
          make_note(D5, N1, f),
          make_note(B4, N1, f),
          make_note(G4, N1, f),
          make_note(E4, N1, f),
        ),
      );
      expect(result).toEqual(expected);
    });
  });

  describe("arpeggiate", () => {
    it("arpeggiates chords relative to relevant chord", () => {
      const rhythm = new Rhythm("xxx-xxx-xxx-xxx-", N4);
      // The usual I-V-vi-IV progression
      const axis_chords = new PatternGrid(
        [
          MAJOR_TRIAD.to_chord(C4),
          MAJOR_TRIAD.to_chord(G4),
          MINOR_TRIAD.to_chord(A4),
          MAJOR_TRIAD.to_chord(F4),
        ],
        new Rational(3, 4),
      );
      // Up one chord, down the next one
      const indices = new PatternGrid([0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0], N4);

      const result = MusicPatterns.arpeggiate(rhythm, axis_chords, indices);

      const expected = new Melody(
        // Up the I chord
        make_note(C4, N4),
        make_note(E4, N4),
        make_note(G4, N2),
        // Down the V chord
        make_note(D5, N4),
        make_note(B4, N4),
        make_note(G4, N2),
        // Up the vi chord
        make_note(A4, N4),
        make_note(C5, N4),
        make_note(E5, N2),
        // Down the IV chord
        make_note(C5, N4),
        make_note(A4, N4),
        make_note(F4, N2),
      );
      expect(result).toEqual(expected);
    });

    it("with velocities sets the note velocities", () => {
      const rhythm = new Rhythm("xxx-xxx-xxx-xxx-", N4);
      // The usual I-V-vi-IV progression
      const axis_chords = new PatternGrid(
        [
          MAJOR_TRIAD.to_chord(C4),
          MAJOR_TRIAD.to_chord(G4),
          MINOR_TRIAD.to_chord(A4),
          MAJOR_TRIAD.to_chord(F4),
        ],
        new Rational(3, 4),
      );
      // Up one chord, down the next one
      const indices = new PatternGrid([0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0], N4);
      const p = Velocity.P;
      const f = Velocity.F;
      const velocities = new PatternGrid([p, p, f, p], new Rational(3, 4));

      const result = MusicPatterns.arpeggiate(
        rhythm,
        axis_chords,
        indices,
        velocities,
      );

      const expected = new Melody(
        // Up the I chord
        make_note(C4, N4, p),
        make_note(E4, N4, p),
        make_note(G4, N2, p),
        // Down the V chord
        make_note(D5, N4, p),
        make_note(B4, N4, p),
        make_note(G4, N2, p),
        // Up the vi chord
        make_note(A4, N4, f),
        make_note(C5, N4, f),
        make_note(E5, N2, f),
        // Down the IV chord
        make_note(C5, N4, p),
        make_note(A4, N4, p),
        make_note(F4, N2, p),
      );
      expect(result).toEqual(expected);
    });
  });
});
