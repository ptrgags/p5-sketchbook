import { describe, it, expect } from "vitest";
import { MusicCycle, Melody, Note, Rest } from "../music/Score";
import { compile_part_events, compile_sequence_pattern } from "./compile_music";
import { N1, N2, N4 } from "../music/durations";
import { C4, E4, G4, REST } from "../music/pitches";
import { Gap, Sequential } from "../music/Timeline";

describe("compile_part_events", () => {
  it("with empty melody returns empty array", () => {
    /** @type{Melody<number>} */
    const empty = new Melody();

    const result = compile_part_events(empty);

    expect(result).toEqual([]);
  });

  it("with only rests returns empty array", () => {
    const rests = new Melody(new Rest(N4), new Rest(N2));

    const result = compile_part_events(rests);

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

describe("compile_sequence_pattern", () => {
  it("with empty sequence returns empty array", () => {
    const empty = new MusicCycle(N1);

    const result = compile_sequence_pattern(empty);

    expect(result).toEqual([]);
  });

  it("with notes and rests returns flat array", () => {
    const cycle = new MusicCycle(
      N1,
      new Note(C4, N2),
      new Rest(N4),
      new Note(E4, N4),
      new Note(G4, N4)
    );

    const result = compile_sequence_pattern(cycle);

    const expected = ["C4", REST, "E4", "G4"];
    expect(result).toEqual(expected);
  });

  it("with nested cycles returns nested array", () => {
    const note = new Note(C4, N4);
    const rest = new Rest(N4);
    const cycle = new MusicCycle(
      N1,
      note,
      new MusicCycle(N1, note, note),
      new MusicCycle(N1, note, new MusicCycle(N1, rest, rest, note)),
      new MusicCycle(N1, note, rest, note)
    );

    const result = compile_sequence_pattern(cycle);

    const expected = [
      "C4",
      ["C4", "C4"],
      ["C4", [REST, REST, "C4"]],
      ["C4", REST, "C4"],
    ];
    expect(result).toEqual(expected);
  });
});
