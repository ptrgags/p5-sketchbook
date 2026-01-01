import { describe, it, expect } from "vitest";
import { MIDIFile, MIDIFormat, MIDIHeader } from "./MIDIFile.js";
import {
  encode_midi,
  HEADER_CHUNK_LENGTH,
  HEADER_MAGIC,
  TRACK_MAGIC,
} from "./encode_midi.js";
import { C3, C4, E5, G4 } from "../music/pitches.js";
import { RelativeTimingTrack } from "./MIDITrack.js";
import { MIDIMessage, MIDIMetaEvent, MIDIMetaType } from "./MIDIEvent.js";

// This will get used a lot, so use the abbreviation parts per quarter
const PPQ = MIDIHeader.DEFAULT_TICKS_PER_QUARTER;

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
  PPQ,
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

    expect(result).toStrictEqual(expected.buffer);
  });

  it("with single note encodes correctly", () => {
    const midi = new MIDIFile(MIDIHeader.DEFAULT_FORMAT0, [
      new RelativeTimingTrack([
        [0, MIDIMessage.note_on(0, C4)],
        [PPQ, MIDIMessage.note_off(0, C4)],
      ]),
    ]);

    const result = encode_midi(midi);

    const expected_length = 12;
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
      // Channel 0: note on C4, velocity 127
      0x90,
      C4,
      127,
      // dt
      PPQ,
      // Channel 0: note off C4, velocity 0
      0x80,
      C4,
      0,
      // dt
      0,
      ...END_OF_TRACK,
    ]);

    expect(result).toStrictEqual(expected.buffer);
  });

  it("encodes format 0 example file correctly", () => {
    // Data based on the example in the MIDI 1.0 spec, however
    // I tweaked some entries since my encoder does not make use of running status
    const header = MIDIHeader.DEFAULT_FORMAT0;
    const forte = 96;
    const mezzo_forte = 64;
    const piano = 32;
    const med_velocity = 64;
    const track = new RelativeTimingTrack([
      [
        0,
        new MIDIMetaEvent(
          MIDIMetaType.TIME_SIGNATURE,
          new Uint8Array([0x04, 0x02, 0x18, 0x08])
        ),
      ],
      [
        0,
        new MIDIMetaEvent(
          MIDIMetaType.SET_TEMPO,
          new Uint8Array([0x07, 0xa1, 0x20])
        ),
      ],
      [0, MIDIMessage.program_change(0, 5)],
      [0, MIDIMessage.program_change(1, 46)],
      [0, MIDIMessage.program_change(2, 70)],
      [0, MIDIMessage.note_on(2, C3, forte)],
      [0, MIDIMessage.note_on(2, C4, forte)],
      [PPQ, MIDIMessage.note_on(1, G4, mezzo_forte)],
      [PPQ, MIDIMessage.note_on(0, E5, piano)],
      [2 * PPQ, MIDIMessage.note_off(2, C3, med_velocity)],
      [0, MIDIMessage.note_off(2, C4, med_velocity)],
      [0, MIDIMessage.note_off(1, G4, med_velocity)],
      [0, MIDIMessage.note_off(0, E5, med_velocity)],
    ]);
    const midi = new MIDIFile(header, [track]);

    const result = encode_midi(midi);

    const expected = new Uint8Array([
      ...FORMAT0_HEADER,
      // track ---------------------------
      ...TRACK_MAGIC,
      // length
      0,
      0,
      0,
      // the example originally had 59 bytes, but I'm not using running status
      // so I added 2 more bytes
      59 + 2,
      // dt
      0,
      // time sig
      0xff,
      0x58,
      0x04,
      0x04,
      0x02,
      0x18,
      0x08,
      // dt
      0,
      // tempo
      0xff,
      0x51,
      0x03,
      0x07,
      0xa1,
      0x20,
      // dt
      0,
      // program change channel 0: EP 2
      0xc0,
      0x05,
      // dt
      0,
      // program change channel 1: Harp
      0xc1,
      0x2e,
      // dt
      0,
      // program change channel 2: Bassoon
      0xc2,
      0x46,
      // dt
      0,
      // note on channel 2, C3, velocity 0x60
      0x92,
      C3,
      forte,
      // dt
      0,
      // note on channel 2, C4, velocity 0x60 (running status removed from example)
      0x92,
      C4,
      forte,
      // dt - one quarter note
      PPQ,
      // Note on channel 1, G4 velocity 0x40
      0x91,
      G4,
      mezzo_forte,
      // dt - second quarter note
      PPQ,
      // Note on channel 0, E5 velocity 0x20
      0x90,
      E5,
      piano,
      // two byte dt
      0x81,
      0x40,
      // note off channel 2, velocity 0x40
      0x82,
      C3,
      0x40,
      // dt
      0,
      // note off channel 2, velocity 0x40
      0x82,
      C4,
      0x40,
      // dt
      0,
      // note off channel 1, velocity 0x40
      0x81,
      G4,
      0x40,
      // dt
      0,
      // note off channel 0, veloicty 0x40
      0x80,
      E5,
      0x40,
      // dt
      0,
      // end of track
      ...END_OF_TRACK,
    ]);
    expect(result).toStrictEqual(expected.buffer);
  });

  it("encodes format 1 example file correctly", () => {
    // Data based on the example in the MIDI 1.0 spec, however
    // I tweaked some entries since my encoder does not make use of running status
    // Also, I'm explicitly adding note offs instead of note on with velocity 0,
    // as this better reflects how my implementation works.
    const header = MIDIHeader.format1(4);
    const forte = 96;
    const mezzo_forte = 64;
    const piano = 32;
    const med_velocity = 64;
    const meta = new RelativeTimingTrack([
      [
        0,
        new MIDIMetaEvent(
          MIDIMetaType.TIME_SIGNATURE,
          new Uint8Array([0x04, 0x02, 0x18, 0x08])
        ),
      ],
      [
        0,
        new MIDIMetaEvent(
          MIDIMetaType.SET_TEMPO,
          new Uint8Array([0x07, 0xa1, 0x20])
        ),
      ],
    ]);
    const channel0 = new RelativeTimingTrack([
      [0, MIDIMessage.program_change(0, 5)],
      [2 * PPQ, MIDIMessage.note_on(0, E5, piano)],
      [2 * PPQ, MIDIMessage.note_off(0, E5, med_velocity)],
    ]);
    const channel1 = new RelativeTimingTrack([
      [0, MIDIMessage.program_change(1, 46)],
      [PPQ, MIDIMessage.note_on(1, G4, mezzo_forte)],
      [3 * PPQ, MIDIMessage.note_off(1, G4, med_velocity)],
    ]);
    const channel2 = new RelativeTimingTrack([
      [0, MIDIMessage.program_change(2, 70)],
      [0, MIDIMessage.note_on(2, C3, forte)],
      [0, MIDIMessage.note_on(2, C4, forte)],
      [4 * PPQ, MIDIMessage.note_off(2, C3, med_velocity)],
      [0, MIDIMessage.note_off(2, C4, med_velocity)],
    ]);
    const midi = new MIDIFile(header, [meta, channel0, channel1, channel2]);

    const result = encode_midi(midi);

    const expected = new Uint8Array([
      ...HEADER_MAGIC,
      // length
      0,
      0,
      0,
      HEADER_CHUNK_LENGTH,
      // format 1
      0,
      MIDIFormat.MULTI_PARALLEL,
      // number of tracks written as a U16
      0,
      4,
      // PPQ as a u16
      0,
      PPQ,
      // track for meta messages ---------------------
      ...TRACK_MAGIC,
      // length
      0,
      0,
      0,
      // one less byte since I'm putting end of track at the last event
      19,
      // dt
      0,
      // time sig
      0xff,
      0x58,
      0x04,
      0x04,
      0x02,
      0x18,
      0x08,
      // dt
      0,
      // tempo
      0xff,
      0x51,
      0x03,
      0x07,
      0xa1,
      0x20,
      0,
      // end of track
      ...END_OF_TRACK,
      // track for channel 0 ---------------------------
      ...TRACK_MAGIC,
      // length
      0,
      0,
      0,
      // 16 + explicitly adding one running status byte
      16 + 1,
      // dt
      0,
      // program change channel 0: EP 2
      0xc0,
      0x05,
      // dt - half note
      0x81,
      0x40,
      // Note on channel 0, E5 velocity 0x20
      0x90,
      E5,
      piano,
      // dt - half note
      0x81,
      0x40,
      // note off channel 0, veloicty 0x40
      0x80,
      E5,
      0x40,
      // dt
      0,
      // end of track
      ...END_OF_TRACK,
      // track for channel 1 -------
      ...TRACK_MAGIC,
      // length + one added running status byte
      0,
      0,
      0,
      15 + 1,
      // dt
      0,
      // program change channel 1: Harp
      0xc1,
      0x2e,
      // dt - one quarter note
      PPQ,
      // Note on channel 1, G4 velocity 0x40
      0x91,
      G4,
      mezzo_forte,
      // two-byte dt
      0x82,
      0x20,
      // note off channel 1, G4 velocity 0x40
      0x81,
      G4,
      0x40,
      // dt
      0,
      // end of track
      ...END_OF_TRACK,
      // track for channel 2 -------
      ...TRACK_MAGIC,
      // length + 3 cases where running status is explicitly written
      0,
      0,
      0,
      21 + 3,
      // dt
      0,
      // program change channel 2: Bassoon
      0xc2,
      0x46,
      // dt
      0,
      // note on channel 2, C3, velocity 0x60
      0x92,
      C3,
      forte,
      // dt
      0,
      // note on channel 2, C4, velocity 0x60 (running status removed from example)
      0x92,
      C4,
      forte,
      // two-byte dt for a whole note
      0x83,
      0x00,
      // note off channel 2, velocity 0x40
      0x82,
      C3,
      0x40,
      // dt
      0,
      // note off channel 2, velocity 0x40
      0x82,
      C4,
      0x40,
      // dt
      0,
      // end of track
      ...END_OF_TRACK,
    ]);
    expect(result).toStrictEqual(expected.buffer);
  });

  it("encodes Ableton-style empty clip", () => {
    const header = MIDIHeader.DEFAULT_FORMAT0;
    const track = new RelativeTimingTrack([
      [0, MIDIMetaEvent.track_name("")],
      [
        0,
        new MIDIMetaEvent(
          MIDIMetaType.TIME_SIGNATURE,
          new Uint8Array([0x04, 0x02, 0x24, 0x08])
        ),
      ],
      [
        0,
        new MIDIMetaEvent(
          MIDIMetaType.TIME_SIGNATURE,
          new Uint8Array([0x04, 0x02, 0x24, 0x08])
        ),
      ],
    ]);
    const midi = new MIDIFile(header, [track]);

    const result = encode_midi(midi);

    // Bytes from an empty clip exported from Ableton
    // https://hexed.it/ was helpful for formatting
    const expected = new Uint8Array([
      // MIDI Header chunk ----------------------------
      // MThd
      0x4d, 0x54, 0x68, 0x64,
      // Length
      0x00, 0x00, 0x00, 0x06,
      // format 0
      0x00, 0x00,
      // number of tracks
      0x00, 0x01,
      // PPQ
      0x00, 0x60,
      // MIDI Track chunk --------------------------
      // MTrk
      0x4d, 0x54, 0x72, 0x6b,
      // Length - 24 bytes from the dt to the end of the end of track
      0x00, 0x00, 0x00, 0x18,
      // dt,
      0x00,
      // track name: empty string
      0xff, 0x03, 0x00,
      // dt
      0x00,
      // time signature
      0xff, 0x58, 0x04, 0x04, 0x02, 0x24, 0x08,
      // dt
      0x00,
      // time signature, again for some reason?
      0xff, 0x58, 0x04, 0x04, 0x02, 0x24, 0x08,
      // dt
      0x00,
      // end of track
      0xff, 0x2f, 0x00,
    ]);
    expect(result).toStrictEqual(expected.buffer);
  });
});
