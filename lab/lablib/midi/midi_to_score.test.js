import { describe, it, expect } from "vitest";
import {
  MIDIFile,
  MIDIFormat,
  MIDIHeader,
  MIDIMessage,
  MIDIMetaEvent,
  MIDITrack,
} from "./MidiFile";
import { midi_to_score } from "./midi_to_score";
import { Harmony, Melody, Note, Rest, Score } from "../music/Score";
import { C3, C4, CS4, D4, DS4, E4, F4, G4 } from "../music/pitches";
import { N1, N2, N4 } from "../music/durations";
import { Rational } from "../Rational";

const PPQ = 96;

/**
 * Create a format 0 MIDI file from a stream of events. The track end event
 * is created automatically.
 * @param {import("./MidiFile").MIDIEvent[]} events The list of MIDI events
 * @returns {MIDIFile} A file
 */
function stub_midi_file(events) {
  const header = new MIDIHeader(MIDIFormat.SINGLE_TRACK, 1, PPQ);

  const end_of_track = MIDIMetaEvent.end_of_track(0);
  const track = new MIDITrack([...events, end_of_track]);

  return new MIDIFile(header, [track]);
}

describe("midi_to_score", () => {
  it("with empty midi file creates empty score", () => {
    const file = stub_midi_file([]);

    const result = midi_to_score(file);

    const expected = new Score({ parts: [] });
    expect(result).toEqual(expected);
  });

  it("with single note on/off pair creates correct score", () => {
    // C4 1 quarter note
    const file = stub_midi_file([
      MIDIMessage.note_on(0, 0, C4, 63),
      MIDIMessage.note_off(PPQ, 0, C4),
    ]);

    const result = midi_to_score(file);

    const expected_part = new Melody(new Note(C4, N4));
    const expected_score = new Score({
      parts: [["channel0", expected_part]],
    });
    expect(result).toEqual(expected_score);
  });

  it("with single chord creates correct score", () => {
    // C4, E4, G4 for 1 whole note
    const file = stub_midi_file([
      // All notes turn on
      MIDIMessage.note_on(0, 0, C4, 127),
      MIDIMessage.note_on(0, 0, E4, 63),
      MIDIMessage.note_on(0, 0, G4, 31),
      // All three notes are turned off at the same tick, but in a slightly
      // different order
      MIDIMessage.note_off(4 * PPQ, 0, C4),
      MIDIMessage.note_off(0, 0, G4),
      MIDIMessage.note_off(0, 0, E4),
    ]);

    const result = midi_to_score(file);

    const expected0 = new Melody(
      new Harmony(new Note(G4, N1), new Note(E4, N1), new Note(C4, N1))
    );
    const expected = new Score({
      parts: [["channel0", expected0]],
    });

    expect(result).toEqual(expected);
  });

  it("with legato melody creates correct score", () => {
    // C4, D4, E4, F4 quarter notes but the tail of each note extends 1/16 into
    // the next note. Like this:
    //
    //             F----
    //         E----
    //     D----
    // C----
    // 0   1   2   3   4  <-- beats
    const file = stub_midi_file([
      MIDIMessage.note_on(0, 0, C4, 127),
      // D starts 1/4 note later, but the C is released 1/4 + 1/16 later
      MIDIMessage.note_on(PPQ, 0, D4, 127),
      MIDIMessage.note_off(0.25 * PPQ, 0, C4),
      // next beat is now 3/16 of a beat later, and again the
      // previous note is released 1/16 after that
      MIDIMessage.note_on(0.75 * PPQ, 0, E4, 127),
      MIDIMessage.note_off(0.25 * PPQ, 0, D4),
      // Same thing as we start F
      MIDIMessage.note_on(0.75 * PPQ, 0, F4, 127),
      MIDIMessage.note_off(0.25 * PPQ, 0, E4),
      // F is the last note of the same duration (5/16)
      // but we're already 1/16 note in, so we wait 4/16 = 1/4
      MIDIMessage.note_off(PPQ, 0, F4),
    ]);

    const dur = new Rational(5, 16);
    const expected_part = new Melody(
      new Harmony(
        // F4
        new Melody(new Rest(N2.add(N4)), new Note(F4, dur)),
        // E4
        new Melody(new Rest(N2), new Note(E4, dur)),
        // D4
        new Melody(new Rest(N4), new Note(D4, dur)),
        // C4
        new Note(C4, dur)
      )
    );

    const result = midi_to_score(file);

    const expected_score = new Score({
      parts: [["channel0", expected_part]],
    });
    expect(result).toEqual(expected_score);
  });

  it("with righthand motion creates correct score", () => {
    // Left hand holds a C3, right hand moves up C4, C#4, D4, D#4 in quarter
    // notes
    const file = stub_midi_file([
      MIDIMessage.note_on(0, 0, C4, 127),
      MIDIMessage.note_on(0, 0, C3, 127), // start long note
      MIDIMessage.note_off(PPQ, 0, C4),
      MIDIMessage.note_on(0, 0, CS4, 127),
      MIDIMessage.note_off(PPQ, 0, CS4),
      MIDIMessage.note_on(0, 0, D4, 127),
      MIDIMessage.note_off(PPQ, 0, D4),
      MIDIMessage.note_on(0, 0, DS4, 127),
      MIDIMessage.note_off(PPQ, 0, DS4),
      MIDIMessage.note_off(0, 0, C3), // end long note
    ]);

    const result = midi_to_score(file);

    const expected_part = new Melody(
      new Harmony(
        //D#4 line
        new Melody(new Rest(N2.add(N4)), new Note(DS4, N4)),
        //D4 line
        new Melody(new Rest(N2), new Note(D4, N4)),
        //C#4 line
        new Melody(new Rest(N4), new Note(CS4, N4)),
        //C4 line
        new Melody(new Note(C4, N4)),
        // C3 line
        new Melody(new Note(C3, N1))
      )
    );

    const expected = new Score({
      parts: [["channel0", expected_part]],
    });

    expect(result).toEqual(expected);
  });

  it("with initial offset adds rest correctly", () => {
    // C4 1 quarter note, but this time it starts on beat 3
    const file = stub_midi_file([
      MIDIMessage.note_on(2 * PPQ, 0, C4, 63),
      MIDIMessage.note_off(PPQ, 0, C4),
    ]);

    const result = midi_to_score(file);

    const expected_part = new Melody(new Rest(N2), new Note(C4, N4));
    const expected_score = new Score({
      parts: [["channel0", expected_part]],
    });
    expect(result).toEqual(expected_score);
  });

  it("with multi-channel events splits into parts", () => {
    // Channel 0 holds a C3,
    // Channel 1 moves up C4, C#4, D4, D#4 in quarter notes.
    // This is the same as the right hand motion example, but because
    // the channel numbers are different, this will result
    // in a 2-part score
    const file = stub_midi_file([
      MIDIMessage.note_on(0, 1, C4, 127),
      MIDIMessage.note_on(0, 0, C3, 127), // start long note
      MIDIMessage.note_off(PPQ, 1, C4),
      MIDIMessage.note_on(0, 1, CS4, 127),
      MIDIMessage.note_off(PPQ, 1, CS4),
      MIDIMessage.note_on(0, 1, D4, 127),
      MIDIMessage.note_off(PPQ, 1, D4),
      MIDIMessage.note_on(0, 1, DS4, 127),
      MIDIMessage.note_off(PPQ, 1, DS4),
      MIDIMessage.note_off(0, 0, C3), // end long note
    ]);

    const result = midi_to_score(file);

    const expected0 = new Melody(new Note(C3, N1));
    const expected1 = new Melody(
      new Note(C4, N4),
      new Note(CS4, N4),
      new Note(D4, N4),
      new Note(DS4, N4)
    );
    const expected = new Score({
      parts: [
        ["channel0", expected0],
        ["channel1", expected1],
      ],
    });
    expect(result).toEqual(expected);
  });
});
