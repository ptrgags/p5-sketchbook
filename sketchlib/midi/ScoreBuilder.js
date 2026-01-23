import { Rest } from "../music/Music.js";
import { Part, Score } from "../music/Score.js";
import { MIDIEvent, MIDIMessage, MIDIMessageType } from "./MIDIEvent.js";
import { NoteStream } from "./NoteStream.js";

export class PartBuilder {
  /**
   * Part Builder
   * @param {number} channel MIDI channel number for this part
   * @param {number} ticks_per_quarter number of MIDI ticks per quarter note
   */
  constructor(channel, ticks_per_quarter) {
    this.channel = channel;
    this.ticks_per_quarter = ticks_per_quarter;

    /**
     * Map of MIDI note number -> NoteStream
     * @type {Map<number, NoteStream>}
     */
    this.note_streams = new Map();
  }

  /**
   * Process a note on/off event by sending it to the
   * appropriate NoteStream, creating one if needed.
   * @param {number} abs_tick
   * @param {MIDIMessage} note_message
   */
  process_note(abs_tick, note_message) {
    const pitch = note_message.data[0];
    if (!this.note_streams.has(pitch)) {
      this.note_streams.set(pitch, new NoteStream(this.ticks_per_quarter));
    }
    const stream = this.note_streams.get(pitch);

    stream.process_message(abs_tick, note_message);
  }

  /**
   * Process a single message
   * @param {number} abs_tick
   * @param {MIDIMessage} message
   * @returns {boolean} True if the message was processed. If false, the message was ignored.
   */
  process_message(abs_tick, message) {
    const { message_type, channel, data } = message;

    if (message_type === MIDIMessageType.PROGRAM_CHANGE) {
      console.log(
        "Ignoring program change: channel",
        channel,
        "program",
        ...data,
      );
      return false;
    }

    if (
      message_type === MIDIMessageType.NOTE_ON ||
      message_type === MIDIMessageType.NOTE_OFF
    ) {
      this.process_note(abs_tick, message);
      return true;
    }

    return false;
  }

  build() {
    return new Part(`channel${this.channel}`, Rest.ZERO, {
      instrument_id: `channel${this.channel}`,
      midi_channel: this.channel,
    });
  }
}

export class ScoreBuilder {
  constructor(ticks_per_quarter) {
    this.ticks_per_quarter = ticks_per_quarter;

    /**
     * List of ignored messages
     * @type {[number, MIDIEvent][]}
     */
    this.ignored = [];

    /**
     * Map of MIDI channel -> PartBuilder
     * @type {Map<number, PartBuilder>}
     */
    this.part_builders = new Map();
  }

  /**
   * Ignore a message, saving it to a list for logging later.
   * @param {number} abs_tick
   * @param {MIDIEvent} event
   */
  ignore(abs_tick, event) {
    this.ignored.push([abs_tick, event]);
  }

  /**
   *
   * @param {number} channel
   * @param {number} abs_tick
   * @param {MIDIMessage} message
   */
  process_channel_message(channel, abs_tick, message) {
    if (!this.part_builders.has(channel)) {
      this.part_builders.set(
        channel,
        new PartBuilder(channel, this.ticks_per_quarter),
      );
    }
    const builder = this.part_builders.get(channel);
    const processed = builder.process_message(abs_tick, message);
    if (!processed) {
      this.ignore(abs_tick, message);
    }
  }

  /**
   * Process a single MIDI message
   * @param {number} abs_tick
   * @param {MIDIEvent} event
   */
  process_event(abs_tick, event) {
    if (event instanceof MIDIMessage) {
      this.process_channel_message(event.channel, abs_tick, event);
    } else {
      this.ignore(abs_tick, event);
    }
  }

  /**
   * Build the score
   * @returns {Score<number>}
   */
  build() {
    if (this.ignored.length > 0) {
      console.log("ignored:", this.ignored);
    }

    const channels = [...this.part_builders.keys()].sort();
    console.log("channels used:", channels);

    return new Score(
      ...channels.map((x) => {
        return this.part_builders.get(x).build();
      }),
    );
  }
}
