import { describe, it, expect } from "vitest";
import { count_voices } from "./count_voices";
import { Cycle, Gap, Loop, Parallel, Sequential } from "./Timeline";
import { N1, N2, N4, N8 } from "./durations";
import { C3, C4, E3, G3, G4 } from "./pitches";
import { Note } from "./Score";

describe("count_voices", () => {
  it("with gap returns 1", () => {
    const gap = new Gap(N2);

    const result = count_voices(gap);

    expect(result).toBe(1);
  });

  it("with single value returns 1", () => {
    const note = new Note(C3, N8);

    const result = count_voices(note);

    expect(result).toBe(1);
  });

  it("with simple sequence returns 1", () => {
    const melody = new Sequential(
      new Note(C3, N8),
      new Note(G3, N8),
      new Note(C4, N8)
    );

    const result = count_voices(melody);
    expect(result).toBe(1);
  });

  it("with simple parallel returns correct number of voices", () => {
    const melody = new Parallel(
      new Note(C3, N8),
      new Note(G3, N8),
      new Note(C4, N8)
    );

    const result = count_voices(melody);

    const expected = 3;
    expect(result).toBe(expected);
  });

  it("with nested parallel returns correct number of voices", () => {
    const nested = new Parallel(
      new Parallel(new Note(C3, N8), new Note(G3, N8)),
      new Note(C3, N8),
      new Parallel(new Note(G3, N8), new Note(C3, N8))
    );

    const result = count_voices(nested);

    // after stacking everything we have 2 + 1 + 2 = 5
    const expected = 5;
    expect(result).toBe(expected);
  });

  it("with sequence of parallel returns the maximum number of voices", () => {
    const chord = new Parallel(
      new Note(C3, N8),
      new Note(E3, N8),
      new Note(G4, N8)
    );
    const melody = new Sequential(chord, new Gap(N4), chord, chord);

    const result = count_voices(melody);

    const expected = 3;
    expect(result).toBe(expected);
  });

  it("with parallel of sequence returns total number of lines", () => {
    const melody = new Sequential(
      new Note(C3, N8),
      new Note(E3, N8),
      new Note(G4, N8)
    );
    const parallel = new Parallel(melody, melody, new Note(C4, N8));

    const result = count_voices(parallel);

    const expected = 3;
    expect(result).toBe(expected);
  });

  it("with loop returns voices in child", () => {
    const chord = new Parallel(
      new Note(C3, N8),
      new Note(E3, N8),
      new Note(G4, N8)
    );
    const loop = new Loop(N1, chord);

    const result = count_voices(loop);

    const expected = 3;
    expect(result).toBe(expected);
  });

  it("with cycle returns maximum voices", () => {
    const chord = new Parallel(
      new Note(C3, N8),
      new Note(E3, N8),
      new Note(G4, N8)
    );
    const cycle = new Cycle(N2, new Note(E3, N4), chord, chord);

    const result = count_voices(cycle);

    const expected = 3;
    expect(result).toBe(expected);
  });
});
