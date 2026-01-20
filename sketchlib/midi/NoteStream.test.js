import { describe, expect, it } from "vitest";
import { NoteStream } from "./NoteStream.js";
import { MIDIFile, MIDIHeader } from "./MIDIFile.js";
import { MIDIMessage } from "./MIDIEvent.js";
import { C4 } from "../music/pitches.js";
import { Note } from "../music/Music.js";
import { Velocity } from "../music/Velocity.js";
import { N1, N2, N4 } from "../music/durations.js";
import { Rational } from "../Rational.js";

const PPQ = MIDIHeader.DEFAULT_TICKS_PER_QUARTER;

describe("NoteStream", () => {
  describe("process_message", () => {
    it("with non note message type throws error", () => {
      const stream = new NoteStream();

      expect(() => {
        stream.process_message(0, MIDIMessage.program_change(0, 32));
      }).toThrowError("message must be a note on or note off event");
    });
  });

  describe("build", () => {
    it("with no notes returns empty array", () => {
      const stream = new NoteStream();

      const result = stream.build();

      expect(result).toEqual([]);
    });

    it("with four quarter notes returns four notes correctly", () => {
      const stream = new NoteStream();
      const velocity = Velocity.MF;

      stream.process_message(0, MIDIMessage.note_on(0, C4, velocity));
      stream.process_message(PPQ, MIDIMessage.note_off(0, C4));
      stream.process_message(PPQ, MIDIMessage.note_on(0, C4, velocity));
      stream.process_message(2 * PPQ, MIDIMessage.note_off(0, C4));
      stream.process_message(2 * PPQ, MIDIMessage.note_on(0, C4, velocity));
      stream.process_message(3 * PPQ, MIDIMessage.note_off(0, C4));
      stream.process_message(3 * PPQ, MIDIMessage.note_on(0, C4, velocity));
      stream.process_message(4 * PPQ, MIDIMessage.note_off(0, C4));
      const result = stream.build();

      const expected = [
        [new Note(C4, N4), Rational.ZERO, N4],
        [new Note(C4, N4), N4, N2],
        [new Note(C4, N4), N2, N2.add(N4)],
        [new Note(C4, N4), N2.add(N4), N1],
      ];
      expect(result).toEqual(expected);
    });

    it("with second note on before note off creats two notes", () => {
      const stream = new NoteStream();
      const velocity = Velocity.MF;

      stream.process_message(0, MIDIMessage.note_on(0, C4, velocity));
      stream.process_message(PPQ, MIDIMessage.note_on(0, C4, velocity));
      stream.process_message(2 * PPQ, MIDIMessage.note_off(0, C4, velocity));
      stream.process_message(3 * PPQ, MIDIMessage.note_off(0, C4, velocity));
      const result = stream.build();

      const expected = [
        [new Note(C4, N4), Rational.ZERO, N4],
        [new Note(C4, N4), N4, N2],
      ];
      expect(result).toEqual(expected);
    });

    it("with notes with gap in betwen correctly computes timing", () => {
      const stream = new NoteStream();
      const velocity = Velocity.MF;

      stream.process_message(0, MIDIMessage.note_on(0, C4, velocity));
      stream.process_message(PPQ, MIDIMessage.note_off(0, C4));
      stream.process_message(2 * PPQ, MIDIMessage.note_on(0, C4, velocity));
      stream.process_message(3 * PPQ, MIDIMessage.note_off(0, C4));
      const result = stream.build();

      const expected = [
        [new Note(C4, N4), Rational.ZERO, N4],
        [new Note(C4, N4), N2, N2.add(N4)],
      ];
      expect(result).toEqual(expected);
    });
  });
});
