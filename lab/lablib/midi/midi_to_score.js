import { N4 } from "../music/durations.js";
import { Melody, Rest, Score } from "../music/Score.js";
import { Rational } from "../Rational.js";
import { MIDIFile, MIDIMessage, MIDIMessageType } from "./MidiFile.js";

/**
 * Do a cumulative sum to convert tick deltas to absolute time since the
 * start of the track
 * @param {import("./MidiFile").MIDIEvent[]} events The events to process
 * @return {[number, import("./MidiFile").MIDIEvent][]} (absolute_time, event)
 */
function deltas_to_absolute(events) {
  let time = 0;
  let result = [];
  for (const event of events) {
    /**
     * @type {[number, import("./MidiFile").MIDIEvent]}
     */
    const absolute = [time, event];
    result.push(absolute);
    time += event.tick_delta;
  }
  return result;
}

/**
 * Push a value to an object at the given key, creating an empty list
 * as needed.
 * @param {object} obj
 * @param {any} key
 * @param {any} value
 */
function create_push(obj, key, value) {
  if (Array.isArray(obj[key])) {
    obj[key].push(value);
  } else {
    obj[key] = [value];
  }
}

/**
 * Extract just the note on/off events by channel number
 * @param {[number, import("./MidiFile.js").MIDIEvent][]} abs_events MIDI events with absolute times
 * @returns {Object.<number, MIDIMessage[]>} Map of channel number to a list of just the note on/off events.
 */
function notes_by_channel(abs_events) {
  /**
   * @type {Object.<number, MIDIMessage[]>}
   */
  const result = {};

  for (const [time, event] of abs_events) {
    if (event instanceof MIDIMessage) {
      const channel = event.channel;
      if (
        event.message_type !== MIDIMessageType.NOTE_ON &&
        event.message_type !== MIDIMessageType.NOTE_OFF
      ) {
        console.warn("ignoring MIDI message", time, event);
        continue;
      }

      create_push(result, channel, [time, event]);
    } else {
      console.warn("ignoring system message", time, event);
    }
  }

  return result;
}

/**
 * Helper class for making parts
 */
class KeyFrame {
  constructor() {
    /**
     * Notes that started at this time
     * @type {Set<number>}
     */
    this.on_set = new Set();
    /**
     * @type {MIDIMessage[]}
     */
    this.on_notes = [];

    /**
     * Notes that were released
     * @type {Set<number>}
     */
    this.off_set = new Set();
    /**
     * @type {MIDIMessage[]}
     */
    this.off_notes = [];
  }

  /**
   * Add a note to this key frame
   * @param {MIDIMessage} note A note on/note off event
   */
  add_note(note) {
    const [pitch, velocity] = note.data;

    const is_off =
      note.message_type == MIDIMessageType.NOTE_OFF || velocity == 0;

    if (is_off) {
      this.off_set.add(pitch);
      this.off_notes.push(note);
    } else {
      this.on_set.add(pitch);
      this.on_notes.push(note);
    }
  }
}

/**
 * @enum number
 */
const MelodyParseState = {
  SILENCE: 0,
  SINGLE_NOTE: 1,
  MULTIPLE_NOTES: 2,
};

/**
 * Because even with ES2024 this isn't included
 * @template T
 * @param {Set<T>} a
 * @param {Set<T>} b
 * @returns {boolean}
 */
function set_equals(a, b) {
  return a.size === b.size && a.isSupersetOf(b);
}

/**
 * Make a part from a list of MIDI note on/off events
 * @param {[number, MIDIMessage][]} abs_notes Notes with absolute time
 * @param {number} ticks_per_quarter MIDI ticks per quarter for converting to  duration
 * @return {Melody<number>} Melody in terms of MIDI note numbers
 */
export function make_part(abs_notes, ticks_per_quarter) {
  /**
   * Gather up notes for each distinct time value
   * @type {Map<number, KeyFrame>}
   */
  const keyframes = new Map();
  for (const [t, note] of abs_notes) {
    if (keyframes[t] === undefined) {
      keyframes[t] = new KeyFrame();
    }

    keyframes[t].add_note(note);
  }
  const times = [...keyframes.keys()].sort();

  // convert from ticks to rational measures
  const to_duration = new Rational(1, ticks_per_quarter).mul(N4);

  // scan over the times and make a melody
  /**
   * @type {import("../music/Score.js").Music<number>[]}
   */
  const music = [];
  let last_end_time = 0;
  let parse_state = MelodyParseState.SILENCE;
  /**
   * @type {Set<number>}
   */
  let active_notes = new Set();
  for (const t of keyframes.keys()) {
    const keyframe = keyframes.get(t);

    if (parse_state == MelodyParseState.SILENCE) {
      if (t > last_end_time) {
        const rest_duration = new Rational(t - last_end_time).mul(to_duration);
        music.push(new Rest(rest_duration));
        last_end_time = t;
      }

      if (keyframe.on_set.size === 1) {
        parse_state = MelodyParseState.SINGLE_NOTE;
        active_notes = keyframe.on_set;
      } else if (keyframe.on_set.size > 1) {
        parse_state = MelodyParseState.MULTIPLE_NOTES;
        active_notes = keyframe.on_set;
      } else {
        throw new Error("silence + no on notes... what's going on here?");
      }
    } else if (parse_state == MelodyParseState.SINGLE_NOTE) {
      if (set_equals(active_notes, keyframe.off_set)) {
      }
    } else if (parse_state == MelodyParseState.MULTIPLE_NOTES) {
    }
  }

  return new Melody(music);
}

/**
 * Convert a MIDIFile object to a Score
 * @param {MIDIFile} midi the MIDI file object
 * @returns {Score}
 */
export function midi_to_score(midi) {
  console.log("converting midi to score:", midi);

  if (midi.header.format !== 0) {
    throw new Error(`Not yet implemented: format ${midi.header.format}`);
  }

  const [track] = midi.tracks;

  const abs_timing = deltas_to_absolute(track.events);

  const notes = notes_by_channel(abs_timing);

  const ticks_per_quarter = midi.header.ticks_per_quarter;
  const parts = [];
  for (const [channel, events] of Object.entries(notes)) {
    const part = make_part(events, ticks_per_quarter);

    parts.push([`channel${channel}`, part]);
  }

  return new Score({
    parts,
  });
}
