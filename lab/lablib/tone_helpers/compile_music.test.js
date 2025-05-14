import { describe, it, expect } from "vitest";
import {
  MusicCycle,
  Melody,
  Note,
  Rest,
  Harmony,
  MusicLoop,
} from "../music/Score.js";
import { N1, N2, N4 } from "../music/durations.js";
import { C4, C5, CS5, E4, G4, REST } from "../music/pitches.js";
import { precompile_music } from "./compile_music.js";
import { CycleDescriptor, PartDescriptor } from "./tone_clips.js";
import { Rational } from "../Rational.js";
import { Loop, Parallel, Sequential } from "../music/Timeline.js";

describe("precompile_music", () => {
  it("single note compiles to part", () => {
    const note = new Note(CS5, N4);

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
      new Note(C4, N2),
      new Note(E4, N4),
      new Rest(N4),
      new Note(G4, N1)
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
      new Note(C4, N2),
      new Note(E4, N4),
      new Rest(N4),
      new Note(G4, N1)
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
    const melody = new Melody(new Rest(N4), new Note(C4, N2));

    const result = precompile_music(melody);

    const expected = new PartDescriptor(new Rational(3, 4), [
      ["0:1", ["C4", "0:2"]],
    ]);
    expect(result).toEqual(expected);
  });

  it("chord compiles to parallel clips (for now)", () => {
    const chord = new Harmony(
      new Note(C4, N1),
      new Note(E4, N1),
      new Note(G4, N1)
    );

    const result = precompile_music(chord);

    const expected = new Parallel(
      new PartDescriptor(N1, [["0:0", ["C4", "1:0"]]]),
      new PartDescriptor(N1, [["0:0", ["E4", "1:0"]]]),
      new PartDescriptor(N1, [["0:0", ["G4", "1:0"]]])
    );
    expect(result).toEqual(expected);
  });

  it("parallel melodies compile to parallel clips", () => {
    const chord = new Harmony(
      new Melody(new Note(C4, N1), new Note(G4, N2)),
      new Note(E4, N1),
      new Melody(new Note(G4, N1), new Rest(N4), new Note(C5, N4))
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
      ])
    );
    expect(result).toEqual(expected);
  });

  it("simple cycle compiles to single cycle clip", () => {
    const cycle = new MusicCycle(
      N1,
      new Note(C4, N1),
      new Rest(N1),
      new Note(C4, N1),
      new Note(G4, N1)
    );

    const result = precompile_music(cycle);

    const expected = new CycleDescriptor(N1, "0:1", ["C4", REST, "C4", "G4"]);
    expect(result).toEqual(expected);
  });

  it("a loop is compiled to a loop of clips", () => {
    const loop = new MusicLoop(
      N1,
      new Melody(new Note(C4, N4), new Note(G4, N4))
    );

    const result = precompile_music(loop);

    const expected = new Loop(
      N1,
      new PartDescriptor(N2, [
        ["0:0", ["C4", "0:1"]],
        ["0:1", ["G4", "0:1"]],
      ])
    );

    expect(result).toEqual(expected);
  });
});
