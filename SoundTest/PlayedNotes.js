import { AbsInterval } from "../sketchlib/music/AbsTimeline.js";
import { Note } from "../sketchlib/music/Music.js";

/**
 * Track the pitches pressed and released at a single instant
 * in time.
 */
class NoteSets {
  constructor() {
    /**
     * @type {Set<number>}
     */
    this.pressed = new Set();
    /**
     * @type {Set<number>}
     */
    this.released = new Set();
  }
}

/**
 * Get a value from a Map, setting a default if needed
 * @template K
 * @template V
 * @param {Map<K, V>} map The map
 * @param {K} key The key to get
 * @param {function(): V} default_func If the key doesn't exist,
 * @returns {V}
 */
function get_or_insert(map, key, default_func) {
  if (!map.has(key)) {
    map.set(key, default_func());
  }
  return map.get(key);
}

/**
 *
 * @param {Map<number, NoteSets>} note_sets
 * @returns {[number, Set<number>][]} A timeline of notes
 */
function compute_held(note_sets) {
  const sorted_times = [...note_sets.keys()].sort();
  const result = [];

  /**
   * @type {Set<number>}
   */
  let current = new Set();
  for (const t of sorted_times) {
    const { pressed, released } = note_sets.get(t);
    const held_set = current.difference(released).union(pressed);

    /**
     * @type {[number, Set<number>]}
     */
    const entry = [t, held_set];

    result.push(entry);
    current = held_set;
  }

  return result;
}

export class PlayedNotes {
  /**
   * Constructor
   * @param {AbsInterval<Note<number>>[]} abs_notes
   */
  constructor(abs_notes) {
    /**
     * @type {Map<number, NoteSets>}
     */
    this.note_sets = new Map();

    for (const interval of abs_notes) {
      const start = interval.start_time.real;
      const end = interval.end_time.real;
      const pitch = interval.value.pitch;

      get_or_insert(this.note_sets, start, () => new NoteSets()).pressed.add(
        pitch,
      );
      get_or_insert(this.note_sets, end, () => new NoteSets()).released.add(
        pitch,
      );
    }

    /**
     * @type {[number, Set<number>][]}
     */
    this.held_notes = compute_held(this.note_sets);
  }

  /**
   * Get the pitches held at time t
   * @param {number} t Time to check
   * @returns {Set<number>}
   */
  get_held_pitches(t) {
    // If t is outside the range, return the empty set
    if (t < this.held_notes[0][0] || t >= this.held_notes.at(-1)[0]) {
      return new Set();
    }

    const larger_index = this.held_notes.findIndex(([time]) => time > t);
    return this.held_notes[larger_index - 1][1];
  }
}
