import { describe, it, expect } from "vitest";
import { to_tone_pitch } from "./to_tone_pitch";
import { C4, FS5, G_1 } from "../music/pitches";

describe("to_tone_pitch", () => {
  it("C4 returns string C4", () => {
    const result = to_tone_pitch(C4);

    const expected = "C4";
    expect(result).toBe(expected);
  });

  it("Sharps use hashtag", () => {
    const result = to_tone_pitch(FS5);

    const expected = "F#5";
    expect(result).toBe(expected);
  });

  it("negative octave is handled correctly", () => {
    const result = to_tone_pitch(G_1);

    const expected = "G-1";
    expect(result).toBe(expected);
  });
});
