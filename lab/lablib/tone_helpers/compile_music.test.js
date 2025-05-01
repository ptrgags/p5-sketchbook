import { describe, it, expect } from "vitest";
import { Melody, Note, Rest } from "../music/Score";
import { compile_part_events } from "./compile_music";
import { N1, N2, N4 } from "../music/durations";
import { C4, E4, G4 } from "../music/pitches";

describe("compile_part_events", () => {
  it("with melody returns empty array", () => {
    const empty = new Melody();

    const result = compile_part_events(empty);

    expect(result).toEqual([]);
  });

  it("with only rests returns empty array", () => {
    const empty = new Melody(new Rest(N4), new Rest(N2));

    const result = compile_part_events(empty);

    expect(result).toEqual([]);
  });

  it("rests at the start of the melody delay the first note", () => {
    const melody = new Melody(new Rest(N4), new Note(C4, N2));

    const result = compile_part_events(melody);

    const expected = [["0:1", ["C4", "0:2"]]];
    expect(result).toEqual(expected);
  });

  it("Computes offsets correctly", () => {
    const melody = new Melody(
      new Note(C4, N2),
      new Rest(N4),
      new Note(E4, N4),
      new Note(G4, N1)
    );

    const result = compile_part_events(melody);

    const expected = [
      ["0:0", ["C4", "0:2"]],
      // rest is skipped
      ["0:3", ["E4", "0:1"]],
      ["1:0", ["G4", "1:0"]],
    ];
    expect(result).toEqual(expected);
  });
});
