import { describe, it, expect } from "vitest";
import { Harmony, Melody, Note, Rest, Score } from "../music/Score.js";
import {
  DEFAULT_TICKS_PER_QUARTER,
  MIDIEvent,
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  MIDIMessage,
  MIDIMetaEvent,
  RelativeTimingTrack,
} from "./MidiFile.js";
import { score_to_midi } from "./score_to_midi.js";
import { C4, D4, E4, F4, G4 } from "../music/pitches.js";
import { N1, N4 } from "../music/durations.js";

// shorthand since this will be used quite a bit.
const QN = DEFAULT_TICKS_PER_QUARTER;

/**
 *
 * @param {import("../music/Score.js").Music<number>} music
 * @returns {Score<number>}
 */
function make_score(music) {
  return new Score({
    parts: [["channel0", music]],
  });
}

/**
 * Shorthand for constructing a format 0 file for the expected result
 * @param {[number, MIDIEvent][]} messages Messages not including the end of track message
 * @returns {MIDIFile<RelativeTimingTrack>}
 */
function make_format0(...messages) {
  const header = new MIDIHeader(MIDIFormat.SINGLE_TRACK, 1);
  const track = new RelativeTimingTrack([...messages]);
  return new MIDIFile(header, [track]);
}

describe("score to midi", () => {
  it("With empty score produces empty MIDI file", () => {
    const empty = make_score(Rest.ZERO);

    const result = score_to_midi(empty);

    const expected = make_format0();
    expect(result).toEqual(expected);
  });

  it("with single note produces correct MIDI messages", () => {
    const single = make_score(new Note(C4, N1));

    const result = score_to_midi(single);

    const expected = make_format0(
      [0, MIDIMessage.note_on(0, C4)],
      [4 * QN, MIDIMessage.note_off(0, C4)]
    );
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

    const result = score_to_midi(single);

    const expected = make_format0(
      [0, MIDIMessage.note_on(0, C4)],
      [QN, MIDIMessage.note_off(0, C4)],
      [0, MIDIMessage.note_on(0, D4)],
      [QN, MIDIMessage.note_off(0, D4)],
      [0, MIDIMessage.note_on(0, E4)],
      [QN, MIDIMessage.note_off(0, E4)],
      [0, MIDIMessage.note_on(0, F4)],
      [QN, MIDIMessage.note_off(0, F4)]
    );
    expect(result).toEqual(expected);
  });

  it("with chord produces correct MIDI messages", () => {
    const single = make_score(
      new Harmony(new Note(G4, N4), new Note(E4, N4), new Note(C4, N4))
    );

    const result = score_to_midi(single);

    const expected = make_format0(
      [0, MIDIMessage.note_on(0, G4)],
      [0, MIDIMessage.note_on(0, E4)],
      [0, MIDIMessage.note_on(0, C4)],
      [QN, MIDIMessage.note_off(0, G4)],
      [0, MIDIMessage.note_on(0, E4)],
      [0, MIDIMessage.note_on(0, C4)]
    );
    expect(result).toEqual(expected);
  });
});
