import { describe, it, expect } from "vitest";
import { Harmony, Melody, Note, Rest } from "./Music.js";
import { N2, N4 } from "./durations.js";
import { transpose_scale_degree } from "./transpose.js";

describe("transpose_scale_degree", () => {
  it("with interval 0 is identity", () => {
    const music = new Melody(new Note(0, N2), new Rest(N4), new Note(1, N4));

    const result = transpose_scale_degree(0, music);

    expect(result).toEqual(music);
  });

  it("with interval increments all pitches", () => {
    const music = new Melody(
      new Note(0, N2),
      new Rest(N4),
      new Note(1, N4),
      new Harmony(new Note(2, N2), new Note(3, N2), new Note(4, N2))
    );

    const result = transpose_scale_degree(3, music);

    const expected = new Melody(
      new Note(3, N2),
      new Rest(N4),
      new Note(4, N4),
      new Harmony(new Note(5, N2), new Note(6, N2), new Note(7, N2))
    );
    expect(result).toEqual(expected);
  });
});
