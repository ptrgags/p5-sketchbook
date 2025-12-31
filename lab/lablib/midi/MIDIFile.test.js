import { describe, it, expect } from "vitest";
import { MIDIMessage } from "./MidiFile.js";
import { C4 } from "../music/pitches.js";

function make_empty_view(length) {
  return new DataView(new ArrayBuffer(length));
}

function make_view(bytes) {
  return new DataView(new Uint8Array(bytes).buffer);
}

describe("MIDIMessage", () => {
  describe("encode", () => {
    it("encodes note on event", () => {
      const note_on = MIDIMessage.note_on(1, C4, 64);
      const data_view = make_empty_view(3);

      const after = note_on.encode(data_view, 0);

      const expected = make_view([0x91, C4, 64]);
      expect(data_view).toEqual(expected);
      expect(after).toBe(3);
    });
  });
});

describe("MIDIMetaEvent", () => {
  describe("encode", () => {});
});

describe("MIDISysex", () => {
  describe("encode", () => {});
});
