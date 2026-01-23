import { describe, it, expect } from "vitest";
import { MIDIFile, MIDIHeader } from "./MIDIFile.js";
import { Part, Score } from "../music/Score.js";
import { RelativeTimingTrack } from "./MIDITrack.js";
import { midi_to_score } from "./midi_to_score.js";
import { MIDIEvent, MIDIMessage } from "./MIDIEvent.js";
import { C4 } from "../music/pitches.js";
import { Note } from "../music/Music.js";
import { N4 } from "../music/durations.js";

const PPQ = MIDIHeader.DEFAULT_TICKS_PER_QUARTER;

// Make a format0 MIDI file
/**
 *
 * @param  {...[number, MIDIEvent]} messages
 * @returns
 */
function make_midi(...messages) {
  return new MIDIFile(MIDIHeader.DEFAULT_FORMAT0, [
    new RelativeTimingTrack(messages),
  ]);
}

describe("midi_to_score", () => {
  it("with empty MIDI file produces empty score", () => {
    const empty = new MIDIFile(MIDIHeader.DEFAULT_FORMAT0, [
      new RelativeTimingTrack([]),
    ]);

    const result = midi_to_score(empty);

    const expected = new Score();
    expect(result).toEqual(expected);
  });

  it("with single note returns single-part score", () => {
    const one_note = make_midi(
      [0, MIDIMessage.note_on(0, C4)],
      [PPQ, MIDIMessage.note_off(0, C4)],
    );

    const result = midi_to_score(one_note);

    const expected_score = new Score(
      new Part("channel0", new Note(C4, N4), {
        midi_channel: 0,
        instrument_id: "channel0",
      }),
    );
    expect(result).toEqual(expected_score);
  });
});
