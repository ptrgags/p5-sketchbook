import { describe, it, expect } from "vitest";
import { Harmony, make_note, Melody, Note, Rest } from "./Music.js";
import { N2, N4 } from "./durations.js";
import { transpose_scale_degree } from "./transpose.js";

describe("transpose_scale_degree", () => {
  it("with interval 0 is identity", () => {
    const music = new Melody(make_note(0, N2), new Rest(N4), make_note(1, N4));

    const result = transpose_scale_degree(0, music);

    expect(result).toEqual(music);
  });

  it("with interval increments all pitches", () => {
    const music = new Melody(
      make_note(0, N2),
      new Rest(N4),
      make_note(1, N4),
      new Harmony(make_note(2, N2), make_note(3, N2), make_note(4, N2)),
    );

    const result = transpose_scale_degree(3, music);

    const expected = new Melody(
      make_note(3, N2),
      new Rest(N4),
      make_note(4, N4),
      new Harmony(make_note(5, N2), make_note(6, N2), make_note(7, N2)),
    );
    expect(result).toEqual(expected);
  });
});
