import { describe, it, expect } from "vitest";
import { MIDIPitch } from "./pitch_conversions.js";
import { B, C, C4, E, E5, F_1 } from "./pitches.js";

describe("MidiPitch", () => {
  describe("get_pitch_class", () => {
    it("throws for negative pitch", () => {
      expect(() => {
        return MIDIPitch.get_pitch_class(-1);
      }).toThrowError("midi_pitch must be in [0, 127]");
    });

    it("throws for out-of-range pitch", () => {
      expect(() => {
        return MIDIPitch.get_pitch_class(128);
      }).toThrowError("midi_pitch must be in [0, 127]");
    });

    it("C4 is pitch class 0 = C", () => {
      const result = MIDIPitch.get_pitch_class(C4);

      expect(result).toBe(C);
    });

    it("E5 is pitch class 4 = E", () => {
      const result = MIDIPitch.get_pitch_class(E5);

      expect(result).toBe(E);
    });
  });

  describe("get_octave", () => {
    it("throws for negative pitch", () => {
      expect(() => {
        return MIDIPitch.get_octave(-1);
      }).toThrowError("midi_pitch must be in [0, 127]");
    });

    it("throws for out-of-range pitch", () => {
      expect(() => {
        return MIDIPitch.get_octave(128);
      }).toThrowError("midi_pitch must be in [0, 127]");
    });

    it("C4 is octave 4", () => {
      const result = MIDIPitch.get_octave(C4);

      expect(result).toBe(4);
    });

    it("F-1 is octave 0", () => {
      const result = MIDIPitch.get_octave(F_1);
    });
  });

  describe("from_pitch_octave", () => {
    it("C4 is MIDI note 60", () => {
      const result = MIDIPitch.from_pitch_octave(C, 4);

      expect(result).toBe(60);
    });

    it("C-1 is MIDI note 0", () => {
      const result = MIDIPitch.from_pitch_octave(C, -1);

      expect(result).toBe(0);
    });

    it("throws for out-of-range pitch", () => {
      expect(() => {
        // MIDI only goes up to G9
        return MIDIPitch.from_pitch_octave(B, 9);
      }).toThrowError("out of MIDI range");
    });
  });
});
