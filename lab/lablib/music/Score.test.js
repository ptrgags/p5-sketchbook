import { describe, it, expect } from "vitest";
import { map_pitch, Melody, Note, parse_melody, Rest } from "./Score.js";
import { N2, N4, N8 } from "./durations.js";
import { Rational } from "../Rational.js";
import { C, C4, E, E4, G4 } from "./pitches.js";
import { MidiPitch } from "./pitch_conversions.js";

describe("Melody", () => {
  it("duration computes sum of notes", () => {
    const melody = new Melody(new Note(3, N4), new Rest(N8), new Note(4, N4));
    const result = melody.duration;

    // 2/4 + 1/8 = 5/8
    const expected = new Rational(5, 8);
    expect(result).toEqual(expected);
  });
});

describe("map_pitch", () => {
  it("converts pitch between formats", () => {
    const melody = new Melody(new Note(C4, N4), new Rest(N4), new Note(E4, N4));

    const result = map_pitch(MidiPitch.get_pitch_class, melody);

    // Same melody but with the octave numbers removed
    const expected = new Melody(new Note(C, N4), new Rest(N4), new Note(E, N4));
    expect(result).toEqual(expected);
  });
});

describe("parse_melody", () => {
  it("parses melody from array", () => {
    /**
     * @type {[number | undefined, Rational][]}
     */
    const tuples = [
      [C4, N4],
      [undefined, N2],
      [G4, N4],
    ];

    const result = parse_melody(...tuples);

    const expected = new Melody(
      new Note(C4, N4),
      new Rest(N2),
      new Note(G4, N4)
    );

    expect(result).toEqual(expected);
  });
});
