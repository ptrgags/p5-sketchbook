import { describe, it, expect } from "vitest";
import { ChordQuality } from "./Chord.js";
import { M2, m2, m3, M3, m7, M7, P1, P5, T } from "./intervals.js";
import { MAJOR_TRIAD, MINOR7 } from "./chords.js";
import { A, A4, CS, CS6 } from "./pitches.js";

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
});
