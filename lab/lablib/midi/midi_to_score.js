import { N4 } from "../music/durations.js";
import { Harmony, Melody, Note, Rest, Score } from "../music/Score.js";
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
  /**
   * Constructor
   * @param {number} time The time of this frame in MIDI ticks
   */
  constructor(time) {
    this.time = time;

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
 * Ordered map of keyframes that allows different methods of querying
 */
class SortedKeyFrames {
  /**
   * Constructor
   * @param {Map<number, KeyFrame>} keyframes The keyframes stored by time
   */
  constructor(keyframes) {
    this.keyframes = keyframes;
    /**
     * @type {number[]}
     */
    this.times = [...keyframes.keys()].sort();
  }

  /**
   * Get the total number of keyframes
   */
  get length() {
    return this.times.length;
  }

  /**
   *
   * @param {*} index
   * @returns
   */
  get_time(index) {
    return this.times[index];
  }

  /**
   * Find the points in the stream of notes where all notes are released,
   * this is a preprocessing step for generating note data.
   *
   * @returns {boolean[]}
   */
  find_releases() {
    // Scan over the intervals between keyframes and check for points where
    // all notes are released.
    const releases_everything = new Array(this.keyframes.size).fill(false);
    releases_everything[0] = true;

    for (const interval of this.intervals()) {
      const i = interval.index + 1;
      releases_everything[i] = interval.after_pitches.size === 0;
    }

    return releases_everything;
  }

  /**
   * Extract notes from the musical timeline
   * @param {Rational} to_duration Scale factor
   * @returns {import("../music/Score.js").Music<number>[]} Music material
   */
  extract_notes(to_duration) {
    const releases_everything = this.find_releases();

    const music = [];
    let run_start = 0;
    for (const interval of this.intervals()) {
      const i = interval.index + 1;
      if (!releases_everything[i]) {
        continue;
      }

      if (i - run_start === 1) {
        music.push(
          make_simple_music(
            interval.before_frame,
            interval.after_frame,
            to_duration
          )
        );
      } else {
        const relevant_times = this.times.slice(run_start, i + 1);
        const relevant_frames = relevant_times.map((t) =>
          this.keyframes.get(t)
        );

        music.push(make_complex_harmony(relevant_frames, to_duration));
      }
      run_start = i;
    }

    return music;
  }

  /**
   * Iterate over the keyframes pairwise, giving the state before
   * and after the interval of time
   * @returns {Generator<{
   * index: number,
   * duration: number,
   * before_frame: KeyFrame,
   * after_frame: KeyFrame,
   * before_pitches: Set<number>,
   * after_pitches: Set<number>
   * }>}
   */
  *intervals() {
    /**
     * @type {Set<number>}
     */
    let active_set = new Set();
    for (let i = 1; i < this.keyframes.size; i++) {
      const before_time = this.times[i - 1];
      const after_time = this.times[i];
      const before_frame = this.keyframes.get(before_time);
      const after_frame = this.keyframes.get(after_time);

      const on = before_frame.on_set;
      const off = after_frame.off_set;
      const after_interval = active_set.union(on).difference(off);

      yield {
        index: i - 1,
        duration: after_time - before_time,
        before_frame,
        after_frame,
        before_pitches: active_set,
        after_pitches: after_interval,
      };
      active_set = after_interval;
    }
  }
}

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
 * Gather the MIDI events by distinct time values
 * @param {[number, MIDIMessage][]} abs_notes(time, msg) notes with absolute times
 * @return {SortedKeyFrames}
 */
function make_keyframes(abs_notes) {
  const keyframes = new Map();
  for (const [t, note] of abs_notes) {
    if (!keyframes.has(t)) {
      keyframes.set(t, new KeyFrame(t));
    }

    keyframes.get(t).add_note(note);
  }

  return new SortedKeyFrames(keyframes);
}

/**
 * Parse a simple bit of music from consecutive frames. This will either be
 * a rest, a single note, or a chord of notes all of the same duration
 * @param {KeyFrame} start_frame
 * @param {KeyFrame} end_frame
 * @param {Rational} to_duration Scale factor for converting ticks to rational measures
 * @return {import("../music/Score.js").Music<number>} A music value for this interval
 */
function make_simple_music(start_frame, end_frame, to_duration) {
  const duration = new Rational(end_frame.time - start_frame.time).mul(
    to_duration
  );

  const pitches = start_frame.on_set;

  // I have no notes.
  if (pitches.size == 0) {
    return new Rest(duration);
  }

  // I have one note.
  if (pitches.size == 1) {
    // TODO: Eventually I want to extract the velocity from the on_notes
    const [pitch] = [...pitches];
    return new Note(pitch, duration);
  }

  // I have many notes.
  const pitches_descending = [...pitches].sort().reverse();
  return new Harmony(...pitches_descending.map((x) => new Note(x, duration)));
}

/**
 * Extract a Melody of notes and rests for a single pitch
 * @param {KeyFrame[]} frames The relevant frames
 * @param {Rational} to_duration scale factor for converting ticks to rational measures
 * @param {number} pitch The pitch to examine
 * @returns {Melody<number>}
 */
function extract_pitch_line(frames, to_duration, pitch) {
  const notes = [];

  let is_active = frames[0].on_set.has(pitch);
  let last_start = frames[0].time;
  for (let i = 1; i < frames.length; i++) {
    const frame = frames[i];
    const released = frame.off_set.has(pitch);
    const pressed = frame.on_set.has(pitch);

    /*  active  pressed  released   action               active'
     *    0       0        0         add duration          0
     *    0       0        x         add duration          0
     *    0       1        x         emit gap,             1
     *    0       1        x         emit gap,             1
     *    1       0        0         add duration          1
     *    1       0        1         emit note             0
     *    1       1        0         emit note             1
     *    1       1        1         emit note             1
     */

    if (!is_active && pressed) {
      // continue the rest
      is_active = pressed;
    } else if (!is_active) {
      // emit a rest
      const delta = frame.time - last_start;
      last_start = frame.time;

      const rest = new Rest(new Rational(delta).mul(to_duration));
      notes.push(rest);

      is_active = pressed;
    } else if (released || pressed) {
      // we had an active note, and it either was released, or
      // a new note overrides it. Either way, emit the note
      const delta = frame.time - last_start;
      last_start = frame.time;

      const note = new Note(pitch, new Rational(delta).mul(to_duration));
      notes.push(note);

      is_active = pressed;
    } else {
      // sustain the active note
      is_active = true;
    }
  }

  // TODO: handle the final note/rest

  return new Melody(...notes);
}

/**
 * For notes that overlap partially, we need a different method for parsing it
 * @param {KeyFrame[]} frames The relevant frames
 * @param {Rational} to_duration Scale factor for converting ticks to rational measures
 * @returns {import("../music/Score.js").Music<number>} Music data for this section of music
 */
function make_complex_harmony(frames, to_duration) {
  const start_frame = frames[0];
  const end_frame = frames[frames.length - 1];
  const duration = new Rational(end_frame.time - start_frame.time).mul(
    to_duration
  );

  // Gather all the pitches
  let all_pitches = frames[0].on_set;
  for (let i = 1; i < frames.length - 1; i++) {
    all_pitches = all_pitches.union(frames[i].on_set).union(frames[i].off_set);
  }
  all_pitches = all_pitches.union(frames[frames.length - 1].off_set);

  const pitches_descending = [...all_pitches].sort().reverse();
  return new Harmony(
    ...pitches_descending.map((pitch) =>
      extract_pitch_line(frames, to_duration, pitch)
    )
  );
}

/**
 * Make a part from a list of MIDI note on/off events
 * @param {[number, MIDIMessage][]} abs_notes Notes with absolute time
 * @param {number} ticks_per_quarter MIDI ticks per quarter for converting to  duration
 * @return {Melody<number>} Melody in terms of MIDI note numbers
 */
export function make_part(abs_notes, ticks_per_quarter) {
  // Preprocess the notes so we know what intervals can be parsed as simple
  // rests/notes/chords and which ones are more complicated harmonies that
  // are parsed by a different method.
  const keyframes = make_keyframes(abs_notes);

  // convert from ticks to rational measures
  const to_duration = new Rational(1, ticks_per_quarter).mul(N4);

  // Handle an initial delay if there is one
  const start = keyframes.get_time(0);
  /**
   * @type {import("../music/Score.js").Music<number>[]}
   */
  const initial_pause = [];
  if (start > 0) {
    const delay = new Rational(start).mul(to_duration);
    initial_pause.push(new Rest(delay));
  }

  return new Melody(...initial_pause, ...keyframes.extract_notes(to_duration));
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
    /**
     * @type {[string, import("../music/Score.js").Music<number>]}
     */
    const part_entry = [`channel${channel}`, part];

    parts.push(part_entry);
  }

  return new Score({
    parts,
  });
}
