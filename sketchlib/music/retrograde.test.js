import { describe, it, expect } from "vitest";
import { Harmony, Melody, Note, Rest } from "./Score";
import { N1, N2, N4 } from "./durations";
import { C4, E4, G4 } from "./pitches";
import { retrograde } from "./retrograde";
import { Rational } from "../Rational";

describe("retrograde", () => {
  it("with note is identity", () => {
    const note = new Note(C4, N2);

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
      new Note(C4, N2),
      new Note(E4, N2),
      new Rest(N4),
      new Note(G4, N1)
    );

    const result = retrograde(melody);

    const expected = new Melody(
      new Note(G4, N1),
      new Rest(N4),
      new Note(E4, N2),
      new Note(C4, N2)
    );
    expect(result).toEqual(expected);
  });

  it("with equal-length chord is identity", () => {
    const chord = new Harmony(
      new Note(C4, N2),
      new Note(E4, N2),
      new Note(G4, N2)
    );

    const result = retrograde(chord);

    expect(result).toEqual(chord);
  });

  it("with uneven length chord adds gaps", () => {
    const chord = new Harmony(
      new Note(C4, N1),
      new Note(E4, N2),
      new Note(G4, N4)
    );

    const result = retrograde(chord);

    const expected = new Harmony(
      new Note(C4, N1),
      new Melody(new Rest(N2), new Note(E4, N2)),
      new Melody(new Rest(new Rational(3, 4)), new Note(G4, N4))
    );
    expect(result).toEqual(expected);
  });

  it("with harmony of melodies reverses each melody", () => {
    const harmony = new Harmony(
      new Melody(new Note(C4, N1), new Rest(N2), new Note(E4, N2)),
      new Melody(new Note(C4, N2), new Note(G4, N2), new Note(E4, N2))
    );

    const result = retrograde(harmony);

    const expected = new Harmony(
      new Melody(new Note(E4, N2), new Rest(N2), new Note(C4, N1)),
      new Melody(
        new Rest(N2),
        new Melody(new Note(E4, N2), new Note(G4, N2), new Note(C4, N2))
      )
    );
    expect(result).toEqual(expected);
  });
});
