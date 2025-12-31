import { describe, it, expect } from "vitest";
import { Harmony, Melody, Note, Rest, Score } from "../music/Score.js";
import { MIDIHeader } from "./MIDIFile.js";
import { score_to_midi } from "./score_to_midi.js";
import { C3, C4, D4, E4, F4, G4 } from "../music/pitches.js";
import { N1, N2, N4 } from "../music/durations.js";
import { MIDIMessage } from "./MIDIEvent.js";

// shorthand since this will be used quite a bit.
const QN = MIDIHeader.DEFAULT_TICKS_PER_QUARTER;

/**
 * Shorthand to make a score with a single part
 * @param {import("../music/Score.js").Music<number>} music
 * @returns {Score<number>}
 */
function make_score(music) {
  return new Score({
    parts: [["channel0", music]],
  });
}

describe("score_to_midi", () => {
  it("Sets the default format0 header", () => {
    const score = make_score(new Note(C4, N1));

    const result = score_to_midi(score);

    expect(result.header).toEqual(MIDIHeader.DEFAULT_FORMAT0);
  });

  it("With empty score produces empty MIDI file", () => {
    const empty = make_score(Rest.ZERO);

    const result = score_to_midi(empty).to_testable();

    const expected = [[]];
    expect(result).toEqual(expected);
  });

  it("with single note produces correct MIDI messages", () => {
    const single = make_score(new Note(C4, N1));

    const result = score_to_midi(single).to_testable();

    const expected = [
      [
        [0, MIDIMessage.note_on(0, C4)],
        [4 * QN, MIDIMessage.note_off(0, C4)],
      ],
    ];
    expect(result).toEqual(expected);
  });

  it("with melody produces correct MIDI messages", () => {
    const single = make_score(
      new Melody(
        new Note(C4, N4),
        new Note(D4, N4),
        new Note(E4, N4),
        new Note(F4, N4)
      )
    );

    const result = score_to_midi(single).to_testable();

    // times are absolute in testable form
    const expected = [
      [
        [0, MIDIMessage.note_on(0, C4)],
        [QN, MIDIMessage.note_off(0, C4)],
        [QN, MIDIMessage.note_on(0, D4)],
        [2 * QN, MIDIMessage.note_off(0, D4)],
        [2 * QN, MIDIMessage.note_on(0, E4)],
        [3 * QN, MIDIMessage.note_off(0, E4)],
        [3 * QN, MIDIMessage.note_on(0, F4)],
        [4 * QN, MIDIMessage.note_off(0, F4)],
      ],
    ];
    expect(result).toEqual(expected);
  });

  it("with melody with rest produces correct MIDI messages", () => {
    const single = make_score(
      new Melody(
        new Note(C4, N4),
        new Rest(N4),
        new Note(E4, N4),
        new Note(F4, N4)
      )
    );

    const result = score_to_midi(single).to_testable();

    const expected = [
      [
        [0, MIDIMessage.note_on(0, C4)],
        [QN, MIDIMessage.note_off(0, C4)],
        [2 * QN, MIDIMessage.note_on(0, E4)],
        [3 * QN, MIDIMessage.note_off(0, E4)],
        [3 * QN, MIDIMessage.note_on(0, F4)],
        [4 * QN, MIDIMessage.note_off(0, F4)],
      ],
    ];
    expect(result).toEqual(expected);
  });

  it("with chord produces correct MIDI messages", () => {
    const single = make_score(
      new Harmony(new Note(G4, N4), new Note(E4, N4), new Note(C4, N4))
    );

    const result = score_to_midi(single).to_testable();

    const expected = [
      [
        [0, MIDIMessage.note_on(0, C4)],
        [0, MIDIMessage.note_on(0, E4)],
        [0, MIDIMessage.note_on(0, G4)],
        [QN, MIDIMessage.note_off(0, C4)],
        [QN, MIDIMessage.note_off(0, E4)],
        [QN, MIDIMessage.note_off(0, G4)],
      ],
    ];
    expect(result).toEqual(expected);
  });

  it("with harmony produces correct MIDI messages", () => {
    const score = make_score(
      new Harmony(
        new Melody(new Note(C4, N4), new Note(E4, N4), new Note(G4, N2)),
        new Note(C3, N1)
      )
    );

    const result = score_to_midi(score).to_testable();

    const expected = [
      [
        [0, MIDIMessage.note_on(0, C3)],
        [0, MIDIMessage.note_on(0, C4)],
        [QN, MIDIMessage.note_off(0, C4)],
        [QN, MIDIMessage.note_on(0, E4)],
        [2 * QN, MIDIMessage.note_off(0, E4)],
        [2 * QN, MIDIMessage.note_on(0, G4)],
        [4 * QN, MIDIMessage.note_off(0, C3)],
        [4 * QN, MIDIMessage.note_off(0, G4)],
      ],
    ];
    expect(result).toEqual(expected);
  });

  it("with legato melody produces correct MIDI messages", () => {
    const score = make_score(
      new Harmony(
        new Note(C4, N2),
        new Melody(new Rest(N4), new Note(D4, N2)),
        new Melody(new Rest(N2), new Note(E4, N2)),
        new Melody(new Rest(N2.add(N4)), new Note(F4, N2))
      )
    );

    const result = score_to_midi(score).to_testable();

    const expected = [
      [
        [0, MIDIMessage.note_on(0, C4)],
        [QN, MIDIMessage.note_on(0, D4)],
        [2 * QN, MIDIMessage.note_off(0, C4)],
        [2 * QN, MIDIMessage.note_on(0, E4)],
        [3 * QN, MIDIMessage.note_off(0, D4)],
        [3 * QN, MIDIMessage.note_on(0, F4)],
        [4 * QN, MIDIMessage.note_off(0, E4)],
        [5 * QN, MIDIMessage.note_off(0, F4)],
      ],
    ];
    expect(result).toEqual(expected);
  });

  it("with multiple parts produces MIDI notes on different channels", () => {
    // same material as in the harmony test, but now expressed as multiple parts
    const score = new Score({
      parts: [
        [
          "channel0",
          new Melody(new Note(C4, N4), new Note(E4, N4), new Note(G4, N2)),
        ],
        ["channel1", new Note(C3, N1)],
      ],
    });

    const result = score_to_midi(score).to_testable();

    const expected = [
      [
        [0, MIDIMessage.note_on(0, C4)],
        [0, MIDIMessage.note_on(1, C3)],
        [QN, MIDIMessage.note_off(0, C4)],
        [QN, MIDIMessage.note_on(0, E4)],
        [2 * QN, MIDIMessage.note_off(0, E4)],
        [2 * QN, MIDIMessage.note_on(0, G4)],
        [4 * QN, MIDIMessage.note_off(0, G4)],
        [4 * QN, MIDIMessage.note_off(1, C3)],
      ],
    ];
    expect(result).toEqual(expected);
  });

  it("with too many parts throws", () => {
    const music = new Note(C4, N1);
    /**
     * @type {[string, import("../music/Score.js").Music<number>][]}
     */
    const parts = new Array(20).fill(0).map((x, i) => {
      /** @type {[string, import("../music/Score.js").Music<number>]}*/
      return [`channel${x}`, music];
    });
    const sick_unison = new Score({
      parts,
    });

    expect(() => {
      return score_to_midi(sick_unison);
    }).toThrowError("scores with more than 16 parts not supported!");
  });
});
