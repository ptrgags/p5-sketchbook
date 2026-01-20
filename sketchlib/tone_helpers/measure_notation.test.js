import { describe, it, expect } from "vitest";
import { to_tone_time } from "./to_tone_time";
import { Rational } from "../Rational";

describe("to_tone_time", () => {
  it("0 is wrtten as 0:0", () => {
    const result = to_tone_time(Rational.ZERO);

    const expected = "0:0";
    expect(result).toBe(expected);
  });

  it("converts time to measures:quarter_notes", () => {
    const seven_beats = new Rational(7, 4);

    const result = to_tone_time(seven_beats);

    // 7 beats is 1 measure 3 beats in 4/4 time
    const expected = "1:3";
    expect(result).toBe(expected);
  });

  it("converts other subdivisions to beats", () => {
    // 6 fifth notes is 1/5 of a measure more
    const measure_and_fifth = new Rational(6, 5);

    const result = to_tone_time(measure_and_fifth);

    // 1/5 measures * 4 beats/measure = 0.8 measures
    // but in practice it's more like "1:0.7999999998"... it's a string
    // so annoying to check.
    expect(result).toMatch(/1:(0.8|0.79+8)/);
  });
});
