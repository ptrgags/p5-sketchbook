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
     * On a note on event
     */
    this.partial_message = undefined;
  }

  note_on(abs_time, pitch, velocity) {
    throw new Error("not implemented");
  }

  note_off(abs_time, pitch, velocity) {
    throw new Error("not implemented");
  }

  /**
   * Add a message to the stream
   * @param {number} abs_time Absolute time of the message
   * @param {MIDIMessage} message The note on/note off event
   */
  process_message(abs_time, message) {
    if (message.message_type === MIDIMessageType.NOTE_ON) {
      const [pitch, velocity] = message.data;
      this.note_on(abs_time, pitch, velocity);
    } else if (message.message_type === MIDIMessageType.NOTE_OFF) {
      const [pitch, velocity] = message.data;
      this.note_off(abs_time, pitch, velocity);
    }

    throw new Error("message must be a note on or note off event");
  }

  /**
   *
   * @returns {[Note, Rational, Rational][]} Sequence of absolute note events
   */
  build() {
    return [];
  }
}
