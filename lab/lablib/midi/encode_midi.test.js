import { describe, it, expect } from "vitest";
import {
  DEFAULT_TICKS_PER_QUARTER,
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  RelativeTimingTrack,
} from "./MidiFile.js";
import {
  encode_midi,
  HEADER_CHUNK_LENGTH,
  HEADER_MAGIC,
  TRACK_MAGIC,
} from "./encode_midi.js";

// This will be the same in many tests
const FORMAT0_HEADER = [
  // HEADER -----------------
  ...HEADER_MAGIC,
  // length is constant, but written as a big-endian U32
  0,
  0,
  0,
  HEADER_CHUNK_LENGTH,
  // format 0 written as a U16
  0,
  MIDIFormat.SINGLE_TRACK,
  // number of tracks written as a U16
  0,
  1,
  // PPQ written as a U16
  0,
  DEFAULT_TICKS_PER_QUARTER,
];

// end of track messages are always the same 3 bytes
const END_OF_TRACK = [0xff, 0x2f, 0x00];

describe("encode_midi", () => {
  it("with empty MIDI file encodes correctly", () => {
    const midi = new MIDIFile(MIDIHeader.DEFAULT_FORMAT0, [
      new RelativeTimingTrack([]),
    ]);

    const result = encode_midi(midi);

    const expected_length = END_OF_TRACK.length + 1;
    const expected = new Uint8Array([
      ...FORMAT0_HEADER,
      // TRACK --------------------
      ...TRACK_MAGIC,
      // length of message data as a U32
      0,
      0,
      0,
      expected_length,
      // dt
      0,
      ...END_OF_TRACK,
    ]);

    expect(result).toEqual(expected.buffer);
  });
});
