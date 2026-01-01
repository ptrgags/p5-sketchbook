import { describe, it, expect } from "vitest";
import { decode_midi } from "./decode_midi.js";
import { MIDIFile, MIDIHeader } from "./MIDIFile.js";
import { RelativeTimingTrack } from "./MIDITrack.js";
import { MIDIMessage, MIDIMetaEvent, MIDIMetaType } from "./MIDIEvent.js";
import { C3, C4, E5, G4 } from "../music/pitches.js";

const PPQ = MIDIHeader.DEFAULT_TICKS_PER_QUARTER;

describe("decode_midi", () => {
  it("decodes Ableton-style empty clip", () => {
    // Bytes from an empty clip exported from Ableton
    // https://hexed.it/ was helpful for formatting
    const midi_data = new Uint8Array([
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

    const result = decode_midi(midi_data.buffer);

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
    const expected = new MIDIFile(header, [track]);
    expect(result).toStrictEqual(expected);
  });

  it("decodes format0 example file correctly", () => {
    const forte = 96;
    const mezzo_forte = 64;
    const piano = 32;
    const med_velocity = 64;
    const format0 = new Uint8Array([
      // MThd
      0x4d,
      0x54,
      0x68,
      0x64,
      // Length
      0x00,
      0x00,
      0x00,
      0x06,
      // format 0
      0x00,
      0x00,
      // number of tracks
      0x00,
      0x01,
      // PPQ
      0x00,
      0x60,
      // track ---------------------------
      // MTrk
      0x4d,
      0x54,
      0x72,
      0x6b,
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
      0xff,
      0x2f,
      0x00,
    ]);

    const result = decode_midi(format0.buffer);

    const header = MIDIHeader.DEFAULT_FORMAT0;
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
    const expected = new MIDIFile(header, [track]);
    expect(result.to_testable()).toStrictEqual(expected.to_testable());
  });
});
