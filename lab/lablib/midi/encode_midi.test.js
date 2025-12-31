import { describe, it, expect } from "vitest";
import {
  DEFAULT_TICKS_PER_QUARTER,
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  RelativeTimingTrack,
} from "./MidiFile.js";
import { encode_midi, HEADER_MAGIC, TRACK_MAGIC } from "./encode_midi.js";

// This will be the same in many tests
const FORMAT0_HEADER = [
  // HEADER -----------------
  ...HEADER_MAGIC,
  // length is always 3, but written as a big-endian U32
  0,
  0,
  0,
  MIDIHeader.CHUNK_LENGTH,
  // format 0
  MIDIFormat.SINGLE_TRACK,
  // number of tracks
  1,
  // PPQ
  DEFAULT_TICKS_PER_QUARTER,
];

// end of track messages are always the same 3 bytes
const END_OF_TRACK = [0xff, 0x2f, 0x00];

describe("encode_midi", () => {
  it("with no tracks throws", () => {
    const no_tracks = new MIDIFile(MIDIHeader.DEFAULT_FORMAT0, []);

    expect(() => {
      return encode_midi(no_tracks);
    }).toThrowError("MIDI files must have at least one track");
  });

  it("with empty MIDI file encodes correctly", () => {
    const midi = new MIDIFile(MIDIHeader.DEFAULT_FORMAT0, [
      new RelativeTimingTrack([]),
    ]);

    const result = encode_midi(midi);

    const expected = new Uint8Array([
      ...FORMAT0_HEADER,
      // TRACK --------------------
      ...TRACK_MAGIC,

      // dt
      0,
      ...END_OF_TRACK,
    ]);

    expect(result).toEqual(expected);
  });
});
