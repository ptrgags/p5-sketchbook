import {
  AbsInterval,
  AbsParallel,
  AbsSequential,
} from "../music/AbsTimeline.js";
import { AbsTimelineOps } from "../music/AbsTimelineOps.js";
import { Harmony, Melody, Note } from "../music/Music.js";
import { Part, Score } from "../music/Score.js";
import { Gap } from "../music/Timeline.js";
import { MIDIEvent, MIDIMessage, MIDIMessageType } from "./MIDIEvent.js";
import { NoteStream } from "./NoteStream.js";

/**
 * @template P
 * @param {import("../music/AbsTimeline.js").AbsTimeline<Note<P>>} abs_music
 * @returns {import("../music/Timeline.js").Timeline<Note<P>>}
 */
function timeline_to_music(abs_music) {
  if (abs_music instanceof AbsInterval) {
    return abs_music.value;
  }

  if (abs_music instanceof AbsSequential) {
    return new Melody(...abs_music.children.map((x) => timeline_to_music(x)));
  }

  if (abs_music instanceof AbsParallel) {
    return new Harmony(...abs_music.children.map((x) => timeline_to_music(x)));
  }

  // gap
  return new Gap(abs_music.duration);
}

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

    /**
     * keep track of the maximum tick encountered, as this is needed to
     * finalize the NoteStreams
     */
    this.last_tick = 0;
  }

  /**
   * Process a note on/off event by sending it to the
   * appropriate NoteStream, creating one if needed.
   * @param {number} abs_tick
   * @param {MIDIMessage} note_message
   */
  process_note(abs_tick, note_message) {
    this.last_tick = Math.max(this.last_tick, abs_tick);

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

  /**
   * Build a Part for the score by merging all the note streams together
   * into a single timeline.
   * @returns {Part}
   */
  build() {
    const pitches_hi_to_low = [...this.note_streams.keys()].sort().reverse();
    const intervals = pitches_hi_to_low.flatMap((x) => {
      return this.note_streams.get(x).build(this.last_tick);
    });
    const abs_music = AbsTimelineOps.from_intervals(intervals);
    const music = timeline_to_music(abs_music);
    return new Part(`channel${this.channel}`, music, {
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
