import { describe, it, expect } from "vitest";
import { ChordQuality } from "./Chord.js";
import { M2, m2, m3, M3, m7, M7, P1, P5, T } from "./intervals.js";
import { DIM7, MAJOR7, MAJOR_TRIAD, MINOR7 } from "./chords.js";
import {
  A,
  A3,
  A4,
  AS3,
  AS4,
  C4,
  C5,
  CS,
  CS6,
  DS5,
  E3,
  E7,
  G4,
  REST,
} from "./pitches.js";
import { N4 } from "./durations.js";
import { PatternGrid } from "./PatternGrid.js";
import { ChordVoicing } from "./ChordVoicing.js";

describe("ChordQuality", () => {
  it("formats major chord as M", () => {
    const chord = new ChordQuality([P1, M3, P5]);

    const result = chord.format();

    const expected = "M";
    expect(result).toEqual(expected);
  });

  it("formats unknown chord as question mark", () => {
    const chord = new ChordQuality([P1, m2, M2]);

    const result = chord.format();

    const expected = "?";
    expect(result).toEqual(expected);
  });

  it("formats seventh chord with ascii symbol", () => {
    const chord = new ChordQuality([P1, m3, T, m7]);

    const result = chord.format();

    const expected = "hdim7";
    expect(result).toEqual(expected);
  });
});

describe("ChordSymbol", () => {
  it("formats major chord as pitch class only", () => {
    const chord = MAJOR_TRIAD.to_symbol(A);

    const result = chord.format();

    const expected = "A";
    expect(result).toEqual(expected);
  });

  it("formats chord as pitch class and quality symbol", () => {
    const chord = MINOR7.to_symbol(CS);

    const result = chord.format();

    const expected = "C#m7";
    expect(result).toEqual(expected);
  });
});

describe("Chord", () => {
  it("value with degree in range returns one of the pitches", () => {
    const chord = MAJOR_TRIAD.to_chord(C4);

    const result = chord.value(2);

    const expected = G4;
    expect(result).toEqual(expected);
  });

  it("value with negative value transposes by octaves", () => {
    const chord = MAJOR_TRIAD.to_chord(C4);

    const result = chord.value(-2);

    const expected = E3;
    expect(result).toEqual(expected);
  });

  it("value with value out of range transposes by octaves", () => {
    const chord = MAJOR_TRIAD.to_chord(C4);

    const result = chord.value(10);

    const expected = E7;
    expect(result).toEqual(expected);
  });

  it("formats major chord as pitch only", () => {
    const chord = MAJOR_TRIAD.to_chord(A4);

    const result = chord.format();

    const expected = "A4";
    expect(result).toEqual(expected);
  });

  it("formats chord as pitch and quality symbol", () => {
    const chord = MINOR7.to_chord(CS6);

    const result = chord.format();

    const expected = "C#6m7";
    expect(result).toEqual(expected);
  });

  describe("arpeggiate", () => {
    it("with empty indices returns empty pattern", () => {
      const chord = MAJOR7.to_chord(G4);

      const result = chord.arpeggiate([]);

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with indices returns pattern grid with correct pitches", () => {
      const chord = MINOR7.to_chord(C4);
      const indices = [-1, 0, 3, 4];

      const result = chord.arpeggiate(indices);

      const expected = [AS3, C4, AS4, C5];
      expect(result).toEqual(expected);
    });
  });

  describe("voice", () => {
    it("with no indices returns empty voicing", () => {
      const chord = DIM7.to_chord(C4);

      const result = chord.voice([]);

      const expected = new ChordVoicing([]);
      expect(result).toEqual(expected);
    });

    it("with indices returns voicing with correct pitches", () => {
      const chord = DIM7.to_chord(C4);

      const result = chord.voice([-1, 0, 3, 5]);

      const expected = new ChordVoicing([A3, C4, A4, DS5]);
      expect(result).toEqual(expected);
    });

    it("with REST values reserves voice slots", () => {
      const chord = MAJOR7.to_chord(C4);
      const indices = [0, REST, 2, REST];

      const result = chord.voice(indices);

      const expected = new ChordVoicing([C4, REST, G4, REST]);
      expect(result).toEqual(expected);
    });
  });
});
