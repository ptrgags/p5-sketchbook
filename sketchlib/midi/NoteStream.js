import { AbsInterval } from "../music/AbsTimeline.js";
import { Note } from "../music/Music.js";
import { Rational } from "../Rational.js";
import { MIDIMessage, MIDIMessageType } from "./MIDIEvent.js";
import { MIDIHeader } from "./MIDIFile.js";

export class NoteStream {
  /**
   *
   * @param {number} ticks_per_quarter ticks per quarter for computing note durations
   */
  constructor(ticks_per_quarter = MIDIHeader.DEFAULT_TICKS_PER_QUARTER) {
    this.ticks_per_quarter = ticks_per_quarter;

    /**
     * On a note on event, store the (abs_time, pitch, velocity) of the note
     * event temporarily until we get a note off, or need to end the note
     * for another reason.
     * @type {[number, number, number]}
     */
    this.partial_message = undefined;

    /**
     * @type {AbsInterval<Note>[]}
     */
    this.notes = [];
  }

  /**
   * Convert MIDI ticks to measures
   * @param {number} ticks
   * @returns {Rational}
   */
  to_measures(ticks) {
    // ticks/ticks_per_quarter gives number of quarter notes, divide by
    // 4 to get measures
    return new Rational(ticks, this.ticks_per_quarter * 4);
  }

  /**
   *
   * @param {number} abs_ticks Absolute time in ticks
   * @param {number} pitch MIDI pitch value 0-127
   * @param {number} velocity MIDI velocity value 0-127
   */
  note_on(abs_ticks, pitch, velocity) {
    // If we had a previous note, this flushes it to the array of
    // parsed notes
    this.note_off(abs_ticks);

    this.partial_message = [abs_ticks, pitch, velocity];
  }

  note_off(abs_ticks) {
    if (!this.partial_message) {
      return;
    }

    const [start_ticks, pitch, velocity] = this.partial_message;
    const duration_ticks = abs_ticks - start_ticks;
    const note = new Note(pitch, this.to_measures(duration_ticks), velocity);
    this.notes.push(
      new AbsInterval(
        note,
        this.to_measures(start_ticks),
        this.to_measures(abs_ticks),
      ),
    );
    this.partial_message = undefined;
  }

  /**
   * Add a message to the stream
   * @param {number} abs_ticks Absolute time of the message
   * @param {MIDIMessage} message The note on/note off event
   */
  process_message(abs_ticks, message) {
    if (message.message_type === MIDIMessageType.NOTE_ON) {
      const [pitch, velocity] = message.data;
      this.note_on(abs_ticks, pitch, velocity);
    } else if (message.message_type === MIDIMessageType.NOTE_OFF) {
      this.note_off(abs_ticks);
    } else {
      throw new Error("message must be a note on or note off event");
    }
  }

  /**
   * Flush
   * @param {number} end_time Time of end of track message
   * @returns {AbsInterval<Note>[]} Sequence of absolute note events
   */
  build(end_time) {
    // Flush the note stream before returning the array
    this.note_off(end_time);

    return this.notes;
  }
}
