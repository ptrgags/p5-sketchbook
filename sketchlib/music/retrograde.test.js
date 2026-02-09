import { describe, it, expect } from "vitest";
import { Harmony, make_note, Melody, Note, Rest } from "./Music";
import { N1, N2, N4 } from "./durations";
import { C4, E4, G4 } from "./pitches";
import { retrograde } from "./retrograde";
import { Rational } from "../Rational";

describe("retrograde", () => {
  it("with note is identity", () => {
    const note = make_note(C4, N2);

    const result = retrograde(note);

    expect(result).toEqual(note);
  });

  it("with rest is identity", () => {
    const rest = new Rest(N2);

    const result = retrograde(rest);

    expect(result).toEqual(rest);
  });

  it("with simple melody reverses notes", () => {
    const melody = new Melody(
      make_note(C4, N2),
      make_note(E4, N2),
      new Rest(N4),
      make_note(G4, N1),
    );

    const result = retrograde(melody);

    const expected = new Melody(
      make_note(G4, N1),
      new Rest(N4),
      make_note(E4, N2),
      make_note(C4, N2),
    );
    expect(result).toEqual(expected);
  });

  it("with equal-length chord is identity", () => {
    const chord = new Harmony(
      make_note(C4, N2),
      make_note(E4, N2),
      make_note(G4, N2),
    );

    const result = retrograde(chord);

    expect(result).toEqual(chord);
  });

  it("with uneven length chord adds gaps", () => {
    const chord = new Harmony(
      make_note(C4, N1),
      make_note(E4, N2),
      make_note(G4, N4),
    );

    const result = retrograde(chord);

    const expected = new Harmony(
      make_note(C4, N1),
      new Melody(new Rest(N2), make_note(E4, N2)),
      new Melody(new Rest(new Rational(3, 4)), make_note(G4, N4)),
    );
    expect(result).toEqual(expected);
  });

  it("with harmony of melodies reverses each melody", () => {
    const harmony = new Harmony(
      new Melody(make_note(C4, N1), new Rest(N2), make_note(E4, N2)),
      new Melody(make_note(C4, N2), make_note(G4, N2), make_note(E4, N2)),
    );

    const result = retrograde(harmony);

    const expected = new Harmony(
      new Melody(make_note(E4, N2), new Rest(N2), make_note(C4, N1)),
      new Melody(
        new Rest(N2),
        new Melody(make_note(E4, N2), make_note(G4, N2), make_note(C4, N2)),
      ),
    );
    expect(result).toEqual(expected);
  });
});
