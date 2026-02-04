import { describe, it, expect } from "vitest";
import { Melody, Note, Rest, Harmony, make_note } from "../music/Music.js";
import { N1, N2, N4 } from "../music/durations.js";
import { C4, C5, CS5, E4, G4, REST } from "../music/pitches.js";
import { precompile_music } from "./compile_music.js";
import { PartDescriptor } from "./tone_clips.js";
import { Rational } from "../Rational.js";
import { Parallel, Sequential } from "../music/Timeline.js";

describe("precompile_music", () => {
  it("single note compiles to part", () => {
    const note = make_note(CS5, N4);

    const result = precompile_music(note);

    const expected = new PartDescriptor(N4, [["0:0", ["C#5", "0:1"]]]);
    expect(result).toEqual(expected);
  });

  it("rest compiles to rest", () => {
    const rest = new Rest(N2);

    const result = precompile_music(rest);

    const expected = new Rest(N2);
    expect(result).toEqual(expected);
  });

  it("simple melody compiles to single part", () => {
    const melody = new Melody(
      make_note(C4, N2),
      make_note(E4, N4),
      new Rest(N4),
      make_note(G4, N1),
    );

    const result = precompile_music(melody);

    const expected = new PartDescriptor(new Rational(2, 1), [
      ["0:0", ["C4", "0:2"]],
      ["0:2", ["E4", "0:1"]],
      ["1:0", ["G4", "1:0"]],
    ]);
    expect(result).toEqual(expected);
  });

  it("melody of melodies compiles to multiple parts", () => {
    const sub_melody = new Melody(
      make_note(C4, N2),
      make_note(E4, N4),
      new Rest(N4),
      make_note(G4, N1),
    );
    const melody = new Melody(sub_melody, sub_melody, sub_melody);

    const result = precompile_music(melody);

    const expected_sub = new PartDescriptor(new Rational(2, 1), [
      ["0:0", ["C4", "0:2"]],
      ["0:2", ["E4", "0:1"]],
      ["1:0", ["G4", "1:0"]],
    ]);
    const expected = new Sequential(expected_sub, expected_sub, expected_sub);
    expect(result).toEqual(expected);
  });

  it("melody with initial gap just changes offset", () => {
    const melody = new Melody(new Rest(N4), make_note(C4, N2));

    const result = precompile_music(melody);

    const expected = new PartDescriptor(new Rational(3, 4), [
      ["0:1", ["C4", "0:2"]],
    ]);
    expect(result).toEqual(expected);
  });

  it("chord compiles to parallel clips (for now)", () => {
    const chord = new Harmony(
      make_note(C4, N1),
      make_note(E4, N1),
      make_note(G4, N1),
    );

    const result = precompile_music(chord);

    const expected = new Parallel(
      new PartDescriptor(N1, [["0:0", ["C4", "1:0"]]]),
      new PartDescriptor(N1, [["0:0", ["E4", "1:0"]]]),
      new PartDescriptor(N1, [["0:0", ["G4", "1:0"]]]),
    );
    expect(result).toEqual(expected);
  });

  it("parallel melodies compile to parallel clips", () => {
    const chord = new Harmony(
      new Melody(make_note(C4, N1), make_note(G4, N2)),
      make_note(E4, N1),
      new Melody(make_note(G4, N1), new Rest(N4), make_note(C5, N4)),
    );

    const result = precompile_music(chord);

    const expected = new Parallel(
      new PartDescriptor(new Rational(3, 2), [
        ["0:0", ["C4", "1:0"]],
        ["1:0", ["G4", "0:2"]],
      ]),
      new PartDescriptor(N1, [["0:0", ["E4", "1:0"]]]),
      new PartDescriptor(new Rational(3, 2), [
        ["0:0", ["G4", "1:0"]],
        ["1:1", ["C5", "0:1"]],
      ]),
    );
    expect(result).toEqual(expected);
  });
});
