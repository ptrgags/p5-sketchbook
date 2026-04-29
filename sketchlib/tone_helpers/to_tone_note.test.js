import { describe, it, expect } from "vitest";
import { Note } from "../music/Music.js";
import { G5 } from "../music/pitches.js";
import { to_tone_note } from "./to_tone_note.js";
import { Velocity } from "../music/Velocity.js";

describe("to_tone_note", () => {
  it("with note with default velocity produces correct ToneJS note", () => {
    const note = new Note(G5);

    const result = to_tone_note(note);

    const expected = ["G5", Velocity.MF / 127];
    expect(result).toEqual(expected);
  });

  it("with note and velocity produces correct ToneJS note", () => {
    const note = new Note(G5, Velocity.FFF);

    const result = to_tone_note(note);

    const expected = ["G5", 1];
    expect(result).toEqual(expected);
  });
});
