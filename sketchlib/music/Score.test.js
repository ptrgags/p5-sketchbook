import { describe, it, expect } from "vitest";
import {
  map_pitch,
  Melody,
  Note,
  parse_cycle,
  parse_melody,
  Rest,
} from "./Music.js";
import { N1, N2, N4, N4T, N8, N8T } from "./durations.js";
import { Rational } from "../Rational.js";
import { A4, AS4, B4, C, C4, E, E4, F4, G4, REST } from "./pitches.js";
import { MIDIPitch } from "./MIDIPitch.js";

describe("Melody", () => {
  it("duration computes sum of notes", () => {
    const melody = new Melody(new Note(3, N4), new Rest(N8), new Note(4, N4));
    const result = melody.duration;

    // 2/4 + 1/8 = 5/8
    const expected = new Rational(5, 8);
    expect(result).toEqual(expected);
  });
});

describe("map_pitch", () => {
  it("converts pitch between formats", () => {
    const melody = new Melody(new Note(C4, N4), new Rest(N4), new Note(E4, N4));

    const result = map_pitch(MIDIPitch.get_pitch_class, melody);

    // Same melody but with the octave numbers removed
    const expected = new Melody(new Note(C, N4), new Rest(N4), new Note(E, N4));
    expect(result).toEqual(expected);
  });
});

describe("parse_melody", () => {
  it("parses melody from array", () => {
    /**
     * @type {[number | undefined, Rational][]}
     */
    const tuples = [
      [C4, N4],
      [undefined, N2],
      [G4, N4],
    ];

    const result = parse_melody(...tuples);

    const expected = new Melody(
      new Note(C4, N4),
      new Rest(N2),
      new Note(G4, N4),
    );

    expect(result).toEqual(expected);
  });
});

describe("parse_cycle", () => {
  it("parses single note", () => {
    const cycle = [C4];

    const result = parse_cycle(N4, cycle);

    const expected = new Melody(new Note(C4, N4));
    expect(result).toEqual(expected);
  });

  it("parses single rest", () => {
    const cycle = [REST];

    const result = parse_cycle(N4, cycle);

    const expected = new Melody(new Rest(N4));
    expect(result).toEqual(expected);
  });

  it("parses 2-beat cycle", () => {
    const cycle = [C4, G4];

    const result = parse_cycle(N2, cycle);

    const expected = new Melody(new Note(C4, N4), new Note(G4, N4));
    expect(result).toEqual(expected);
  });

  it("parses 3-beat cycle", () => {
    const cycle = [C4, E4, G4];

    const result = parse_cycle(N2, cycle);

    const expected = new Melody(
      new Note(C4, N4T),
      new Note(E4, N4T),
      new Note(G4, N4T),
    );
    expect(result).toEqual(expected);
  });

  it("parses 4-beat cycle", () => {
    const cycle = [C4, E4, G4, B4];

    const result = parse_cycle(N1, cycle);

    const expected = new Melody(
      new Note(C4, N4),
      new Note(E4, N4),
      new Note(G4, N4),
      new Note(B4, N4),
    );
    expect(result).toEqual(expected);
  });

  it("parses nested cycle", () => {
    const cycle = [C4, [E4, F4], G4, [A4, AS4, B4]];

    const result = parse_cycle(N1, cycle);

    const expected = new Melody(
      new Note(C4, N4),
      new Melody(new Note(E4, N8), new Note(F4, N8)),
      new Note(G4, N4),
      new Melody(new Note(A4, N8T), new Note(AS4, N8T), new Note(B4, N8T)),
    );
    expect(result).toEqual(expected);
  });
});
