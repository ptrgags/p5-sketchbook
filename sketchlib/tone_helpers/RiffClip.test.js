import { describe, it, expect } from "vitest";
import { Riff } from "../music/Riff.js";
import { N4 } from "../music/durations.js";
import { Note } from "../music/Music.js";
import { C4, D4, E4, F4, G4 } from "../music/pitches.js";
import { make_events } from "./RiffClip.js";
import { Velocity } from "../music/Velocity.js";

describe("RiffClip", () => {
  it("make_events formats events for Tone correctly", () => {
    const riff = Riff.literal(
      "x.x.|xx..|x---",
      [
        new Note(C4),
        new Note(D4),
        new Note(E4, Velocity.F),
        new Note(F4),
        new Note(G4, Velocity.FFF),
      ],
      N4,
    );

    const result = make_events(riff);

    const expected = [
      ["0:0", ["0:1", "C4", Velocity.MF / 127]],
      ["0:2", ["0:1", "D4", Velocity.MF / 127]],
      ["1:0", ["0:1", "E4", Velocity.F / 127]],
      ["1:1", ["0:1", "F4", Velocity.MF / 127]],
      ["2:0", ["1:0", "G4", Velocity.FFF / 127]],
    ];
    expect(result).toEqual(expected);
  });
});
