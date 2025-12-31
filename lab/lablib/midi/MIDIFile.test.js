import { describe, it, expect } from "vitest";
import {
  MIDIMessage,
  MIDIMetaEvent,
  MIDIMetaType,
  MIDISysex,
} from "./MidiFile.js";
import { C4, G4 } from "../music/pitches.js";

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

    it("encodes note off event", () => {
      const note_on = MIDIMessage.note_off(1, G4);
      const data_view = make_empty_view(3);

      const after = note_on.encode(data_view, 0);

      const expected = make_view([0x81, G4, 0]);
      expect(data_view).toEqual(expected);
      expect(after).toBe(3);
    });
  });
});

describe("MIDIMetaEvent", () => {
  describe("encode", () => {
    it("encodes meta message", () => {
      const channel = 3;
      const meta = new MIDIMetaEvent(
        MIDIMetaType.CHANNEL_PREFIX,
        new Uint8Array([channel])
      );
      const data_view = make_empty_view(4);

      const after = meta.encode(data_view, 0);

      const expected = make_view([
        MIDIMetaEvent.MAGIC,
        MIDIMetaType.CHANNEL_PREFIX,
        1,
        channel,
      ]);
      expect(data_view).toEqual(expected);
      expect(after).toBe(4);
    });
  });
});

describe("MIDISysex", () => {
  describe("encode", () => {
    it("encodes sysex message", () => {
      const sysex = new MIDISysex(new Uint8Array([1, 2, 3, 4]));
      const data_view = make_empty_view(7);

      const after = sysex.encode(data_view, 0);

      const expected = make_view([
        MIDISysex.MAGIC,
        // length
        5,
        // data
        1,
        2,
        3,
        4,
        MIDISysex.END_OF_SYSEX,
      ]);
      expect(data_view).toEqual(expected);
      expect(after).toBe(7);
    });
  });
});
