import { describe, it, expect } from "vitest";
import { MIDIFile, MIDIHeader } from "./MIDIFile.js";
import { Part, Score } from "../music/Score.js";
import { RelativeTimingTrack } from "./MIDITrack.js";
import { midi_to_score } from "./midi_to_score.js";
import { MIDIEvent, MIDIMessage, MIDIMetaEvent } from "./MIDIEvent.js";
import { C4, E4, G4 } from "../music/pitches.js";
import { Melody, Note, Rest } from "../music/Music.js";
import { N1, N2, N4 } from "../music/durations.js";

const PPQ = MIDIHeader.DEFAULT_TICKS_PER_QUARTER;

// Make a format0 MIDI file
/**
 *
 * @param  {...[number, MIDIEvent]} messages
 * @returns {MIDIFile<RelativeTimingTrack>}
 */
function make_midi(...messages) {
  return new MIDIFile(MIDIHeader.DEFAULT_FORMAT0, [
    new RelativeTimingTrack(messages),
  ]);
}

/**
 * Make a Format 1 MIDI file
 * @param  {...[number, MIDIEvent][]} tracks
 * @returns {MIDIFile<RelativeTimingTrack>}
 */
function make_format1(...tracks) {
  return new MIDIFile(
    MIDIHeader.format1(tracks.length),
    tracks.map((x) => new RelativeTimingTrack(x)),
  );
}

describe("midi_to_score", () => {
  it("with empty MIDI file produces empty score", () => {
    const empty = new MIDIFile(MIDIHeader.DEFAULT_FORMAT0, [
      new RelativeTimingTrack([]),
    ]);

    const result = midi_to_score(empty);

    const expected = [new Score(), []];
    expect(result).toEqual(expected);
  });

  it("with single note returns single-part score", () => {
    const one_note = make_midi(
      [0, MIDIMessage.note_on(0, C4)],
      [PPQ, MIDIMessage.note_off(0, C4)],
    );

    const result = midi_to_score(one_note);

    const expected_score = [
      new Score(
        new Part("channel0", new Note(C4, N4), {
          midi_channel: 0,
          instrument_id: "channel0",
        }),
      ),
      [],
    ];
    expect(result).toEqual(expected_score);
  });

  it("with tempo messages returns parsed tempos", () => {
    // One held note, but getting faster lol
    const with_tempo = make_midi(
      [0, MIDIMetaEvent.set_tempo(128)],
      [0, MIDIMessage.note_on(0, C4)],
      [2 * PPQ, MIDIMetaEvent.set_tempo(256)],
      [2 * PPQ, MIDIMessage.note_off(0, C4)],
    );

    const result = midi_to_score(with_tempo);

    const expected_score = [
      new Score(
        new Part("channel0", new Note(C4, N1), { instrument_id: "channel0" }),
      ),
      [128, 256],
    ];

    expect(result).toEqual(expected_score);
  });

  it("with multiple channels returns multiple parts", () => {
    const one_note = make_midi(
      [0, MIDIMessage.note_on(0, C4)],
      [0, MIDIMessage.note_on(1, E4)],
      [PPQ, MIDIMessage.note_off(0, C4)],
      [0, MIDIMessage.note_off(1, E4)],
    );

    const result = midi_to_score(one_note);

    const expected_score = [
      new Score(
        new Part("channel0", new Note(C4, N4), {
          midi_channel: 0,
          instrument_id: "channel0",
        }),
        new Part("channel1", new Note(E4, N4), {
          midi_channel: 1,
          instrument_id: "channel1",
        }),
      ),
      [],
    ];
    expect(result).toEqual(expected_score);
  });

  it("with channel that starts later returns correct timing", () => {
    const with_delay = make_midi(
      [0, MIDIMessage.note_on(0, C4)],
      [PPQ, MIDIMessage.note_off(0, C4)],
      [0, MIDIMessage.note_on(1, E4)],
      [PPQ, MIDIMessage.note_off(1, E4)],
    );

    const result = midi_to_score(with_delay);

    const expected_score = [
      new Score(
        new Part("channel0", new Note(C4, N4), {
          midi_channel: 0,
          instrument_id: "channel0",
        }),
        new Part("channel1", new Melody(new Rest(N4), new Note(E4, N4)), {
          midi_channel: 1,
          instrument_id: "channel1",
        }),
      ),
      [],
    ];
    expect(result).toEqual(expected_score);
  });

  it("with format1 file parses correctly", () => {
    const format1 = make_format1(
      [[0, MIDIMetaEvent.set_tempo(128)]],
      [
        [0, MIDIMessage.note_on(0, C4)],
        [PPQ, MIDIMessage.note_off(0, C4)],
        [0, MIDIMessage.note_on(0, E4)],
        [PPQ, MIDIMessage.note_off(0, E4)],
      ],
      [
        [0, MIDIMessage.note_on(1, G4)],
        [2 * PPQ, MIDIMessage.note_off(1, G4)],
      ],
    );

    const result = midi_to_score(format1);

    const expected_score = [
      new Score(
        new Part("channel0", new Melody(new Note(C4, N4), new Note(E4, N4)), {
          midi_channel: 0,
          instrument_id: "channel0",
        }),
        new Part("channel1", new Note(G4, N2), {
          midi_channel: 1,
          instrument_id: "channel1",
        }),
      ),
      [128],
    ];
    expect(result).toEqual(expected_score);
  });
});
