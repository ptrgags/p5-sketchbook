import { describe, it, expect } from "vitest";
import { count_voices } from "./count_voices";
import { Gap, Parallel, Sequential } from "./Timeline";
import { N1, N2, N4, N8 } from "./durations";
import { C3, C4, E3, G3, G4 } from "./pitches";
import { make_note, Note } from "./Music";

describe("count_voices", () => {
  it("with gap returns 1", () => {
    const gap = new Gap(N2);

    const result = count_voices(gap);

    expect(result).toBe(1);
  });

  it("with single value returns 1", () => {
    const note = make_note(C3, N8);

    const result = count_voices(note);

    expect(result).toBe(1);
  });

  it("with simple sequence returns 1", () => {
    const melody = new Sequential(
      make_note(C3, N8),
      make_note(G3, N8),
      make_note(C4, N8),
    );

    const result = count_voices(melody);
    expect(result).toBe(1);
  });

  it("with simple parallel returns correct number of voices", () => {
    const melody = new Parallel(
      make_note(C3, N8),
      make_note(G3, N8),
      make_note(C4, N8),
    );

    const result = count_voices(melody);

    const expected = 3;
    expect(result).toBe(expected);
  });

  it("with nested parallel returns correct number of voices", () => {
    const nested = new Parallel(
      new Parallel(make_note(C3, N8), make_note(G3, N8)),
      make_note(C3, N8),
      new Parallel(make_note(G3, N8), make_note(C3, N8)),
    );

    const result = count_voices(nested);

    // after stacking everything we have 2 + 1 + 2 = 5
    const expected = 5;
    expect(result).toBe(expected);
  });

  it("with sequence of parallel returns the maximum number of voices", () => {
    const chord = new Parallel(
      make_note(C3, N8),
      make_note(E3, N8),
      make_note(G4, N8),
    );
    const melody = new Sequential(chord, new Gap(N4), chord, chord);

    const result = count_voices(melody);

    const expected = 3;
    expect(result).toBe(expected);
  });

  it("with parallel of sequence returns total number of lines", () => {
    const melody = new Sequential(
      make_note(C3, N8),
      make_note(E3, N8),
      make_note(G4, N8),
    );
    const parallel = new Parallel(melody, melody, make_note(C4, N8));

    const result = count_voices(parallel);

    const expected = 3;
    expect(result).toBe(expected);
  });
});
