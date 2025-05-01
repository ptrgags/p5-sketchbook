import { describe, it, expect } from "vitest";
import { Melody, Note, Rest } from "./Score.js";
import { N4, N8 } from "./durations.js";
import { Rational } from "../Rational.js";

describe("Melody", () => {
  it("duration computes sum of notes", () => {
    const melody = new Melody(new Note(3, N4), new Rest(N8), new Note(4, N4));

    const result = melody.duration;

    // 2/4 + 1/8 = 5/8
    const expected = new Rational(5, 8);
    expect(result).toEqual(expected);
  });
});
