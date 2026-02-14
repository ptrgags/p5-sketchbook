import { describe, it, expect } from "vitest";
import { PlayedNotes } from "./PlayedNotes.js";
import { AbsInterval } from "../sketchlib/music/AbsTimeline.js";
import { Note } from "../sketchlib/music/Music.js";
import { Rational } from "../sketchlib/Rational.js";
import { C3, C4, D4, E4, F4, G4 } from "../sketchlib/music/pitches.js";
import { N1, N2, N4 } from "../sketchlib/music/durations.js";

/**
 *
 * @param {number} pitch
 * @param {Rational} start_time
 * @param {Rational} end_time
 * @returns {AbsInterval<Note<number>>}
 */
function make_note(pitch, start_time, end_time) {
  return new AbsInterval(new Note(pitch), start_time, end_time);
}

describe("PlayedNotes", () => {
  describe("pitch_range", () => {
    it("with empty list of intervals returns undefined", () => {
      const notes = new PlayedNotes([]);

      const result = notes.pitch_range;

      expect(result).toBeUndefined();
    });

    it("with several notes returns the min and max pitches", () => {
      const notes = new PlayedNotes([
        make_note(C4, Rational.ZERO, N1),
        make_note(E4, N2, new Rational(2)),
        make_note(G4, N1, new Rational(3)),
      ]);

      const result = notes.pitch_range;

      const expected = [C4, G4];
      expect(result).toEqual(expected);
    });
  });

  describe("get_held_pitches", () => {
    it("with t less than start returns empty set", () => {
      const notes = new PlayedNotes([
        make_note(C4, Rational.ZERO, N4),
        make_note(E4, N4, N2),
      ]);

      const result = notes.get_held_pitches(-1.0);

      const expected = new Set();
      expect(result).toEqual(expected);
    });

    it("with t after end returns empty set", () => {
      const notes = new PlayedNotes([
        make_note(C4, Rational.ZERO, N4),
        make_note(E4, N4, N2),
      ]);

      const result = notes.get_held_pitches(10.0);

      const expected = new Set();
      expect(result).toEqual(expected);
    });

    it("with t in the middle of a note returns the correct pitch", () => {
      const notes = new PlayedNotes([
        make_note(C4, Rational.ZERO, N4),
        make_note(E4, N4, N2),
      ]);

      const result = notes.get_held_pitches(1 / 8);

      const expected = new Set([C4]);
      expect(result).toEqual(expected);
    });

    it("with t at note boundary returns pitches after releasing old notes and pressing new ones", () => {
      const notes = new PlayedNotes([
        make_note(C4, Rational.ZERO, N4),
        make_note(E4, N4, N2),
      ]);

      const result = notes.get_held_pitches(1 / 4);

      // 1/4 note into the music, we release the C4 and
      // press an E4
      const expected = new Set([E4]);
      expect(result).toEqual(expected);
    });

    it("with t in gap returns empty set", () => {
      const notes = new PlayedNotes([
        make_note(C4, Rational.ZERO, N4),
        make_note(E4, N2, new Rational(3, 4)),
      ]);

      const result = notes.get_held_pitches(3 / 8);

      const expected = new Set([]);
      expect(result).toEqual(expected);
    });

    it("with chord and t in overlap returns correct pitches", () => {
      const chord = new PlayedNotes([
        make_note(C4, Rational.ZERO, N1),
        make_note(E4, Rational.ZERO, N1),
        make_note(G4, Rational.ZERO, N1),
      ]);

      const result = chord.get_held_pitches(1 / 2);
      const expected = new Set([C4, E4, G4]);
      expect(result).toEqual(expected);
    });

    it("with legato melody and t in overlap returns correct pitches", () => {
      // C---|....|
      // ..E-|----|
      const notes = new PlayedNotes([
        make_note(C4, Rational.ZERO, N1),
        make_note(E4, N2, N1.add(N1)),
      ]);

      const result = notes.get_held_pitches(3 / 4);

      // 1/4 note into the music, we release the C4 and
      // press an E4
      const expected = new Set([C4, E4]);
      expect(result).toEqual(expected);
    });

    it("with legato melody and t after note releases returns correct pitches", () => {
      //
      // C--- .... ....
      // ..E- ---- ....
      // .... G--- ----
      const notes = new PlayedNotes([
        make_note(C4, Rational.ZERO, N1),
        make_note(E4, N2, new Rational(2)),
        make_note(G4, N1, new Rational(3)),
      ]);

      const result = notes.get_held_pitches(2.0);

      // 1/4 note into the music, we release the C4 and
      // press an E4
      const expected = new Set([G4]);
      expect(result).toEqual(expected);
    });

    it("with no music returns empty set", () => {
      const notes = new PlayedNotes([]);

      const result = notes.get_held_pitches(1 / 4);

      const expected = new Set([]);
      expect(result).toEqual(expected);
    });
  });

  describe("debug parallel case", () => {
    const corner_case = new PlayedNotes([
      // bass line
      make_note(C3, Rational.ZERO, N4),
      make_note(C3, N2, new Rational(3, 4)),
      make_note(C3, Rational.ONE, new Rational(5, 4)),
      make_note(C3, new Rational(6, 4), new Rational(7, 4)),
      // scale in parallel starting at measure 1
      make_note(C4, Rational.ONE, new Rational(5, 4)),
      make_note(D4, new Rational(5, 4), new Rational(6, 4)),
      make_note(E4, new Rational(6, 4), new Rational(7, 4)),
      make_note(F4, new Rational(7, 4), new Rational(8, 4)),
    ]);

    it("with t before overlap returns correct pitches", () => {
      const result = corner_case.get_held_pitches(1 / 8);

      const expected = new Set([C3]);
      expect(result).toEqual(expected);
    });

    it("with t at start of overlap returns correct pitches", () => {
      const result = corner_case.get_held_pitches(1);

      const expected = new Set([C3, C4]);
      expect(result).toEqual(expected);
    });

    it("with t in gap of bass line returns correct pitches", () => {
      const result = corner_case.get_held_pitches(11 / 8);

      const expected = new Set([D4]);
      expect(result).toEqual(expected);
    });

    it("with t in middle of overlap returns correct pitches", () => {
      const result = corner_case.get_held_pitches(13 / 8);

      const expected = new Set([C3, E4]);
      expect(result).toEqual(expected);
    });
  });
});
