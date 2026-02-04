import { describe, it, expect } from "vitest";
import { ChordVoicing } from "./ChordVoicing.js";
import { B3, C4, C5, D5, E4, F4, G4, REST } from "./pitches.js";
import { m2, P1, P5 } from "./intervals.js";

describe("ChordVoicing", () => {
  describe("move", () => {});

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

  describe("to_harmony", () => {});
});
