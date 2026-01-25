import {
  AbsInterval,
  AbsParallel,
  AbsSequential,
} from "../music/AbsTimeline.js";
import { AbsTimelineOps } from "../music/AbsTimelineOps.js";
import { Harmony, Melody, Note } from "../music/Music.js";
import { Part, Score } from "../music/Score.js";
import { Gap } from "../music/Timeline.js";
import {
  MIDIEvent,
  MIDIMessage,
  MIDIMessageType,
  MIDIMetaEvent,
  MIDIMetaType,
} from "./MIDIEvent.js";
import { NoteStream } from "./NoteStream.js";

/**
 * @param {import("../music/AbsTimeline.js").AbsTimeline<Note<number>>} abs_music
 * @returns {import("../music/Timeline.js").Timeline<Note<number>>}
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

    /**
     * @type {number[]}
     */
    this.midi_instruments = [];
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
      this.midi_instruments.push(data[0]);
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
      midi_instrument: this.midi_instruments[0],
    });
  }
}

export class ScoreBuilder {
  /**
   *
   * @param {number} ticks_per_quarter Ticks per quarter in the file
   */
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

    /**
     * Array of bpm
     * @type {number[]}
     */
    this.tempo_markings = [];
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
   * Log some of the meta messages to learn about timing
   * @param {number} abs_tick
   * @param {MIDIMetaEvent} event
   */
  process_meta_message(abs_tick, event) {
    const meta_type = event.meta_type;

    if (meta_type === MIDIMetaType.SET_TEMPO) {
      const [t0, t1, t2] = event.data;
      const microsec_per_quarter = (t0 << 16) | (t1 << 8) | t2;
      const MICROSEC_PER_MIN = 60e6;
      const bpm = (1 / microsec_per_quarter) * MICROSEC_PER_MIN;
      this.tempo_markings.push(bpm);
    } else if (meta_type === MIDIMetaType.TIME_SIGNATURE) {
      const [numerator, denominator_power, clocks_per_click, n32_per_quarter] =
        event.data;
      const denominator = 1 << denominator_power;
      console.log(
        `New Time Signature: ${numerator}/${denominator}, metronome click = ${clocks_per_click} clocks, 32nd notes per quarter: ${n32_per_quarter}`,
      );
    }

    this.ignore(abs_tick, event);
  }

  /**
   * Process a single MIDI message
   * @param {number} abs_tick
   * @param {MIDIEvent} event
   */
  process_event(abs_tick, event) {
    if (event instanceof MIDIMessage) {
      this.process_channel_message(event.channel, abs_tick, event);
    } else if (event instanceof MIDIMetaEvent) {
      this.process_meta_message(abs_tick, event);
    } else {
      // sysex
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
