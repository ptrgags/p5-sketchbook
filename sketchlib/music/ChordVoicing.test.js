import { describe, it, expect } from "vitest";
import { ChordVoicing } from "./ChordVoicing.js";
import { B3, B4, C4, C5, CS4, D5, DS4, E4, F4, G4, REST } from "./pitches.js";
import { m2, M3, m3, P1, P5 } from "./intervals.js";
import { Harmony, Note, Rest } from "./Music.js";
import { N1 } from "./durations.js";
import { Velocity } from "./Velocity.js";

describe("ChordVoicing", () => {
  describe("move", () => {
    it("with wrong number of intervals throws error", () => {
      const chord = new ChordVoicing([C4, E4, G4]);
      const intervals = [P1];

      expect(() => {
        return chord.move(intervals);
      }).toThrowError("number of intervals must match number of voices");
    });

    it("with intervals moves pitches by corresponding amounts", () => {
      const intervals = [m3, -m3, M3];
      const chord = new ChordVoicing([C4, E4, G4]);

      const result = chord.move(intervals);

      const expected = new ChordVoicing([DS4, CS4, B4]);
      expect(result).toEqual(expected);
    });

    it("with chord with rests ignores that interval", () => {
      const intervals = [m3, -m3, M3];
      const chord = new ChordVoicing([C4, REST, G4]);

      const result = chord.move(intervals);

      const expected = new ChordVoicing([DS4, REST, B4]);
      expect(result).toEqual(expected);
    });
  });

  describe("sub", () => {
    it("with mismatched voice count throws error", () => {
      const a = new ChordVoicing([C4, E4, G4]);
      const b = new ChordVoicing([C4, E4, G4, C5]);

      expect(() => {
        return a.sub(b);
      }).toThrowError(
        "can only subtract chords with the same number of voices",
      );
    });

    it("with vocing that has rests throws error", () => {
      const a = new ChordVoicing([C4, REST, G4]);
      const b = new ChordVoicing([C4, REST, C5]);

      expect(() => {
        return a.sub(b);
      }).toThrowError("sub only defined for voicings without rests");
    });

    it("voicing minus itself is all unisons", () => {
      const a = new ChordVoicing([C4, E4, G4]);

      const result = a.sub(a);

      const expected = [P1, P1, P1];
      expect(result).toEqual(expected);
    });

    it("with two voicings returns the intervals between them", () => {
      const a = new ChordVoicing([C4, E4, G4]);
      const b = new ChordVoicing([B3, F4, D5]);

      const result = a.sub(b);

      const expected = [m2, -m2, -P5];
      expect(result).toEqual(expected);
    });
  });

  describe("to_harmony", () => {
    it("without velocity creates a harmony of notes at mezzo-forte", () => {
      const chord = new ChordVoicing([C4, E4, G4]);

      const result = chord.to_harmony(N1);

      const expected = new Harmony(
        new Note(G4, N1),
        new Note(E4, N1),
        new Note(C4, N1),
      );
      expect(result).toEqual(expected);
    });

    it("with velocity creates a harmony of notes at that velocity", () => {
      const chord = new ChordVoicing([C4, E4, G4]);

      const result = chord.to_harmony(N1, Velocity.FFF);

      const expected = new Harmony(
        new Note(G4, N1, Velocity.FFF),
        new Note(E4, N1, Velocity.FFF),
        new Note(C4, N1, Velocity.FFF),
      );
      expect(result).toEqual(expected);
    });

    it("with voicing with rests creates a harmony of notes and rests", () => {
      const chord = new ChordVoicing([C4, E4, REST, G4, REST]);

      const result = chord.to_harmony(N1, Velocity.FFF);

      const expected = new Harmony(
        new Rest(N1),
        new Note(G4, N1, Velocity.FFF),
        new Rest(N1),
        new Note(E4, N1, Velocity.FFF),
        new Note(C4, N1, Velocity.FFF),
      );
      expect(result).toEqual(expected);
    });
  });
});
