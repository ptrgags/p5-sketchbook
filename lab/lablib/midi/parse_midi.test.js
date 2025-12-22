import { describe, it, expect } from "vitest";
import { parse_midi_file } from "./parse_midi";
import {
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  MIDIMessage,
  MIDIMessageType,
  MIDIMetaEvent,
  MIDIMetaType,
  MIDITrack,
} from "./MidiFile";

describe("parse_midi", () => {
  it("parses format 0 example", () => {
    // Example data is from https://midimusic.github.io/tech/midispec.html#BMA2_
    const format0_example = new Uint8Array([
      // Header chunk =========================================
      // MThd in ASCII
      0x4d, 0x54, 0x68, 0x64,
      // chunk length (6 bytes)
      0x00, 0x00, 0x00, 0x06,
      // Format 0
      0x00, 0x00,
      // One track
      0x00, 0x01,
      // 96 pulses per quarter-note
      0x00, 0x60,
      // Track chunk ===========================================
      // Mtrk in ASCII
      0x4d, 0x54, 0x72, 0x6b,
      // Chunk length (59)
      0x00, 0x00, 0x00, 0x3b,
      // delta time
      0x00,
      // time signature
      0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08,
      // delta time
      0x00,
      // tempo
      0xff, 0x51, 0x03, 0x07, 0xa1, 0x20,
      // delta time
      0x00,
      // Program change: channel 1 is set to El. Piano 2
      0xc0, 0x05,
      // delta time
      0x00,
      // Program change: channel 2 is set to harp
      0xc1, 0x2e,
      // delta time
      0x00,
      // Program change: channel 3 is et to bassoon
      0xc2, 0x46,
      // delta time
      0x00,
      // Basoon plays a C3, forte
      0x92, 0x30, 0x60,
      // delta time
      0x00,
      // running status version can omit the first byte
      //0x3C, 0x60,
      // Bassoon plays C4, forte
      0x92, 0x30, 0x60,
      // delta time = 96 == 1 quarter note
      0x60,
      // harp plays G4 mezzo forte
      0x91, 0x43, 0x40,
      // delta time = 96 = 1 quarter note
      0x60,
      // EP plays an E5, piano
      0x90, 0x4c, 0x20,
      // two-byte delta-time
      0x81, 0x40,
      // Bassoon releases C3
      0x82, 0x30, 0x40,
      // delta time
      0x00,
      // running status (0x82) - basoon note off
      0x3c, 0x40,
      // delta time
      0x00,
      // Harp releases G4
      0x81, 0x43, 0x40,
      // delta time
      0x00,
      // EP releases E5
      0x80, 0x4c, 0x40,
      // delta time
      0x00,
      // End of track
      0xff, 0x2f, 0x00,
    ]);

    const result = parse_midi_file(format0_example.buffer);

    const expected = new MIDIFile(
      new MIDIHeader(MIDIFormat.SINGLE_TRACK, 1, 96),
      [
        new MIDITrack([
          new MIDIMetaEvent(
            0,
            MIDIMetaType.TIME_SIGNATURE,
            new Uint8Array([0x04, 0x02, 0x18, 0x08])
          ),
          new MIDIMetaEvent(
            0,
            MIDIMetaType.SET_TEMPO,
            new Uint8Array([0x07, 0xa1, 0x20])
          ),
          new MIDIMessage(
            0,
            MIDIMessageType.PROGRAM_CHANGE,
            0,
            new Uint8Array([0x05])
          ),
          new MIDIMessage(
            0,
            MIDIMessageType.PROGRAM_CHANGE,
            1,
            new Uint8Array([0x2e])
          ),
          new MIDIMessage(
            0,
            MIDIMessageType.PROGRAM_CHANGE,
            2,
            new Uint8Array([0x46])
          ),
          // Bassoon plays an octave
          new MIDIMessage(
            0,
            MIDIMessageType.NOTE_ON,
            2,
            new Uint8Array([0x30, 0x60])
          ),
          new MIDIMessage(
            0,
            MIDIMessageType.NOTE_ON,
            2,
            new Uint8Array([0x3c, 0x60])
          ),
          new MIDIMessage(
            96, // 1 quarter note
            MIDIMessageType.NOTE_ON,
            1,
            new Uint8Array([0x43, 0x40])
          ),
          new MIDIMessage(
            96, // 1 quarter note
            MIDIMessageType.NOTE_ON,
            0,
            new Uint8Array([0x4c, 0x20])
          ),
          new MIDIMessage(
            192, // 2 quarter notes
            MIDIMessageType.NOTE_OFF,
            2,
            new Uint8Array([0x30, 0x40])
          ),
          new MIDIMessage(
            0,
            MIDIMessageType.NOTE_OFF,
            2,
            new Uint8Array([0x3c, 0x40])
          ),
          new MIDIMessage(
            0,
            MIDIMessageType.NOTE_OFF,
            1,
            new Uint8Array([0x43, 0x40])
          ),
          new MIDIMessage(
            0,
            MIDIMessageType.NOTE_OFF,
            0,
            new Uint8Array([0x4c, 0x40])
          ),
          new MIDIMetaEvent(0, MIDIMetaType.END_OF_TRACK, new Uint8Array([])),
        ]),
      ]
    );
    expect(result).toEqual(expected);
  });
});
