import { describe, it, expect } from "vitest";
import { MAJOR_SCALE, PHRYGIAN_MODE } from "./scales.js";
import {
  A,
  A3,
  A4,
  B,
  B4,
  C,
  C4,
  D,
  D4,
  E,
  E4,
  F,
  F4,
  F5,
  G,
  G2,
  G4,
} from "./pitches.js";
import { N4 } from "./durations.js";
import { PatternGrid } from "./PatternGrid.js";
import { ScaleQuality, ScaleSymbol } from "./Scale.js";
import { ChordQuality } from "./Chord.js";
import { P1 } from "./intervals.js";
import {
  DIMINISHED_TRIAD,
  DOM7,
  HALF_DIM7,
  MAJOR7,
  MAJOR_TRIAD,
  MINOR7,
  MINOR_TRIAD,
} from "./chords.js";

describe("ScaleQuality", () => {
  it("mode with negative index throws error", () => {
    // major scale
    const scale = new ScaleQuality([0, 2, 4, 5, 7, 9, 11]);

    expect(() => {
      return scale.mode(-1);
    }).toThrowError("start_index must be an integer in [0, 6]");
  });

  it("mode with index out of range throws", () => {
    // major scale
    const scale = new ScaleQuality([0, 2, 4, 5, 7, 9, 11]);

    expect(() => {
      return scale.mode(10);
    }).toThrowError("start_index must be an integer in [0, 6]");
  });

  it("mode with 0 as start index is identity", () => {
    // major scale
    const scale = new ScaleQuality([0, 2, 4, 5, 7, 9, 11]);

    const result = scale.mode(0);

    expect(result).toEqual(scale);
  });

  it("mode with start index produces correct quality", () => {
    // major scale
    const scale = new ScaleQuality([0, 2, 4, 5, 7, 9, 11]);

    const result = scale.mode(2);

    // phyrgian mode is a major scale starting on the third
    const expected = new ScaleQuality([0, 1, 3, 5, 7, 8, 10]);
    expect(result).toEqual(expected);
  });

  it("stack_thirds with 0 throws error", () => {
    // major scale
    const scale = new ScaleQuality([0, 2, 4, 5, 7, 9, 11]);

    expect(() => {
      return scale.stack_thirds(0);
    }).toThrowError("n must be an integer in [1, 7]");
  });

  it("stack_thirds with 1 returns trivial chords", () => {
    // major scale
    const scale = new ScaleQuality([0, 2, 4, 5, 7, 9, 11]);

    const result = scale.stack_thirds(1);

    // 1-note chords are just the root note
    const expected = [
      new ChordQuality([P1]),
      new ChordQuality([P1]),
      new ChordQuality([P1]),
      new ChordQuality([P1]),
      new ChordQuality([P1]),
      new ChordQuality([P1]),
      new ChordQuality([P1]),
    ];
    expect(result).toEqual(expected);
  });

  it("stack_thirds with major scale and n=3 returns correct triads", () => {
    // major scale
    const scale = new ScaleQuality([0, 2, 4, 5, 7, 9, 11]);

    const result = scale.stack_thirds(3);

    const expected = [
      MAJOR_TRIAD,
      MINOR_TRIAD,
      MINOR_TRIAD,
      MAJOR_TRIAD,
      MAJOR_TRIAD,
      MINOR_TRIAD,
      DIMINISHED_TRIAD,
    ];
    expect(result).toEqual(expected);
  });

  it("stack_thirds with major scale and n=4 returns correct seventh chords", () => {
    // major scale
    const scale = new ScaleQuality([0, 2, 4, 5, 7, 9, 11]);

    const result = scale.stack_thirds(4);

    const expected = [MAJOR7, MINOR7, MINOR7, MAJOR7, DOM7, MINOR7, HALF_DIM7];
    expect(result).toEqual(expected);
  });
});

describe("ScaleSymbol", () => {
  it("mode computes correct scale symbol", () => {
    const scale = MAJOR_SCALE.to_symbol(C);

    const result = scale.mode(2);

    const expected = PHRYGIAN_MODE.to_symbol(E);
    expect(result).toEqual(expected);
  });

  it("stack_thirds computes correct chord symbols", () => {
    const scale = MAJOR_SCALE.to_symbol(C);

    const result = scale.stack_thirds(3);

    const expected = [
      MAJOR_TRIAD.to_symbol(C),
      MINOR_TRIAD.to_symbol(D),
      MINOR_TRIAD.to_symbol(E),
      MAJOR_TRIAD.to_symbol(F),
      MAJOR_TRIAD.to_symbol(G),
      MINOR_TRIAD.to_symbol(A),
      DIMINISHED_TRIAD.to_symbol(B),
    ];
    expect(result).toEqual(expected);
  });
});

describe("Scale", () => {
  it("value with degree in range returns one of the pitches", () => {
    const scale = MAJOR_SCALE.to_scale(C4);

    const result = scale.value(2);

    const expected = E4;
    expect(result).toEqual(expected);
  });

  it("value with negative value transposes by octaves", () => {
    const scale = MAJOR_SCALE.to_scale(C4);

    const result = scale.value(-10);

    const expected = G2;
    expect(result).toEqual(expected);
  });

  it("value with value out of range transposes by octaves", () => {
    const scale = MAJOR_SCALE.to_scale(C4);

    const result = scale.value(10);

    const expected = F5;
    expect(result).toEqual(expected);
  });

  it("sequence produces a pattern based on scale degrees", () => {
    const scale = MAJOR_SCALE.to_scale(C4);
    const degrees = [0, 4, -2, 3];

    const result = scale.sequence(degrees, N4);

    const expected = new PatternGrid([C4, G4, A3, F4], N4);
    expect(result).toEqual(expected);
  });

  it("mode computes correct scale symbol", () => {
    const scale = MAJOR_SCALE.to_scale(C4);

    const result = scale.mode(2);

    const expected = PHRYGIAN_MODE.to_scale(E4);
    expect(result).toEqual(expected);
  });

  it("stack_thirds computes correct chord symbols", () => {
    const scale = MAJOR_SCALE.to_scale(C4);

    const result = scale.stack_thirds(3);

    const expected = [
      MAJOR_TRIAD.to_chord(C4),
      MINOR_TRIAD.to_chord(D4),
      MINOR_TRIAD.to_chord(E4),
      MAJOR_TRIAD.to_chord(F4),
      MAJOR_TRIAD.to_chord(G4),
      MINOR_TRIAD.to_chord(A4),
      DIMINISHED_TRIAD.to_chord(B4),
    ];
    expect(result).toEqual(expected);
  });
});
