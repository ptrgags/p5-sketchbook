import { describe, it, expect } from "vitest";
import { Harmony, make_note, Melody, Rest } from "../music/Music.js";
import { Part, Score } from "../music/Score.js";
import { MIDIHeader } from "./MIDIFile.js";
import { MIDIExportFormat, score_to_midi } from "./score_to_midi.js";
import { C3, C4, D4, E4, F4, G4 } from "../music/pitches.js";
import { N1, N2, N4 } from "../music/durations.js";
import { MIDIMessage } from "./MIDIEvent.js";

// shorthand since this will be used quite a bit.
const QN = MIDIHeader.DEFAULT_TICKS_PER_QUARTER;

/**
 * Shorthand to make a score with a single part
 * @param {import("../music/Music.js").Music<number>[]} music
 * @returns {Score<number>}
 */
function make_score(...music) {
  const parts = music.map((x, i) => {
    return new Part(`channel${i}`, x, {
      midi_channel: i,
      instrument_id: "sine",
    });
  });
  return new Score(...parts);
}

describe("score_to_midi", () => {
  it("Sets the default format0 header", () => {
    const score = make_score(make_note(C4, N1));

    const result = score_to_midi(score, MIDIExportFormat.CLIPS);

    expect(result.header).toEqual(MIDIHeader.DEFAULT_FORMAT0);
  });

  it("With empty score produces empty MIDI file", () => {
    const empty = make_score(Rest.ZERO);

    const result = score_to_midi(empty, MIDIExportFormat.CLIPS).to_testable();

    const expected = [[]];
    expect(result).toEqual(expected);
  });

  it("with single note produces correct MIDI messages", () => {
    const single = make_score(make_note(C4, N1));

    const result = score_to_midi(single, MIDIExportFormat.CLIPS).to_testable();

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
        make_note(C4, N4),
        make_note(D4, N4),
        make_note(E4, N4),
        make_note(F4, N4),
      ),
    );

    const result = score_to_midi(single, MIDIExportFormat.CLIPS).to_testable();

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
        make_note(C4, N4),
        new Rest(N4),
        make_note(E4, N4),
        make_note(F4, N4),
      ),
    );

    const result = score_to_midi(single, MIDIExportFormat.CLIPS).to_testable();

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
      new Harmony(make_note(G4, N4), make_note(E4, N4), make_note(C4, N4)),
    );

    const result = score_to_midi(single, MIDIExportFormat.CLIPS).to_testable();

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
        new Melody(make_note(C4, N4), make_note(E4, N4), make_note(G4, N2)),
        make_note(C3, N1),
      ),
    );

    const result = score_to_midi(score, MIDIExportFormat.CLIPS).to_testable();

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
        make_note(C4, N2),
        new Melody(new Rest(N4), make_note(D4, N2)),
        new Melody(new Rest(N2), make_note(E4, N2)),
        new Melody(new Rest(N2.add(N4)), make_note(F4, N2)),
      ),
    );

    const result = score_to_midi(score, MIDIExportFormat.CLIPS).to_testable();

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

  it("with multiple parts produces a format 1 MIDI file", () => {
    // same material as in the harmony test, but now expressed as multiple parts
    const music1 = new Melody(
      make_note(C4, N4),
      make_note(E4, N4),
      make_note(G4, N2),
    );
    const music2 = make_note(C3, N1);
    const score = make_score(music1, music2);

    const result = score_to_midi(score, MIDIExportFormat.CLIPS);

    const expected_tracks = 2;
    const expected_header = MIDIHeader.format1(expected_tracks);
    expect(result.header).toStrictEqual(expected_header);
    expect(result.tracks.length).toBe(expected_tracks);
  });

  it("with multiple parts produces MIDI notes on different tracks by channel", () => {
    // same material as in the harmony test, but now expressed as multiple parts
    const music1 = new Melody(
      make_note(C4, N4),
      make_note(E4, N4),
      make_note(G4, N2),
    );
    const music2 = make_note(C3, N1);
    const score = make_score(music1, music2);

    const result = score_to_midi(score, MIDIExportFormat.CLIPS).to_testable();

    const expected = [
      [
        [0, MIDIMessage.note_on(0, C4)],
        [QN, MIDIMessage.note_off(0, C4)],
        [QN, MIDIMessage.note_on(0, E4)],
        [2 * QN, MIDIMessage.note_off(0, E4)],
        [2 * QN, MIDIMessage.note_on(0, G4)],
        [4 * QN, MIDIMessage.note_off(0, G4)],
      ],
      [
        [0, MIDIMessage.note_on(1, C3)],
        [4 * QN, MIDIMessage.note_off(1, C3)],
      ],
    ];
    expect(result).toEqual(expected);
  });

  it("with too many parts throws", () => {
    const music = make_note(C4, N1);
    const parts = new Array(20).fill(0).map((_, i) => {
      return new Part(`channel${i}`, music, { instrument_id: "sine" });
    });
    const sick_unison = new Score(...parts);

    expect(() => {
      return score_to_midi(sick_unison, MIDIExportFormat.CLIPS);
    }).toThrowError("scores with more than 16 parts not supported!");
  });
});
