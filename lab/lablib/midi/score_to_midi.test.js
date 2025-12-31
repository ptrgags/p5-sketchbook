import { describe, it, expect } from "vitest";
import { Harmony, Melody, Note, Rest, Score } from "../music/Score.js";
import {
  DEFAULT_TICKS_PER_QUARTER,
  MIDIHeader,
  MIDIMessage,
} from "./MidiFile.js";
import { score_to_midi } from "./score_to_midi.js";
import { C4, D4, E4, F4, G4 } from "../music/pitches.js";
import { N1, N4 } from "../music/durations.js";

// shorthand since this will be used quite a bit.
const QN = DEFAULT_TICKS_PER_QUARTER;

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

describe("score to midi", () => {
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
});
