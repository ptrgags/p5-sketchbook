import { describe, it, expect } from "vitest";
import { MIDIFile, MIDIHeader } from "./MIDIFile.js";
import { Score } from "../music/Score.js";
import { RelativeTimingTrack } from "./MIDITrack.js";
import { midi_to_score } from "./midi_to_score.js";

describe("midi_to_score", () => {
  it("with empty MIDI file produces empty score", () => {
    const empty = new MIDIFile(MIDIHeader.DEFAULT_FORMAT0, [
      new RelativeTimingTrack([]),
    ]);

    const result = midi_to_score(empty);

    const expected = new Score();
    expect(result).toEqual(expected);
  });
});
