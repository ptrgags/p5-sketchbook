import { mod } from "../mod.js";
import { P8 } from "./intervals.js";

/**
 * Stack of musical intervals. This is a helper class used by both
 * scales and chords.
 */
export class IntervalStack {
  /**
   * Constructor
   * @param {number[]} intervals Intervals in the stack
   */
  constructor(intervals) {
    this.intervals = intervals;
  }

  get length() {
    return this.intervals.length;
  }

  /**
   * Get an interval value for a given value in the list. When the index
   * is out of bounds, it transposes up or down by octaves.
   *
   * For example, say we had a 3-note stack for a major chord (P1, M3, P5)
   * Index 0 is P1
   * index 2 is P5
   * Index -1 is P5 - P8
   * Index 3 is P1 + P8
   *
   * Note that if the interval stack spans more than an octave,
   * @param {number} index Index into the intervals list.
   */
  value(index) {
    const octaves = Math.floor(index / this.intervals.length);
    const reduced_index = mod(index, this.intervals.length);

    return octaves * P8 + this.intervals[reduced_index];
  }
}

/**
 * An interval stack rooted at one of the 12 pitch classes.
 *
 * This is used for chord symbols and pitch symbols, more for
 * music theory analysis than practical use.
 */
export class PitchClassStack {
  /**
   * Constructor
   * @param {IntervalStack} intervals
   * @param {number} pitch_class Pitch class (e.g. C)
   */
  constructor(intervals, pitch_class) {
    this.pitch_class = pitch_class;
    this.intervals = intervals;
  }

  get length() {
    return this.intervals.length;
  }

  /**
   * Get a ptich from the stack, starting from the root pitch and
   * going up the stack one by one.
   *
   * When the index is out of range, the result is reduced mod 12
   * @param {number} index Index of pitch class relative to the start
   * @returns {number} An pitch class at the selected index
   */
  value(index) {
    return mod(this.pitch_class + this.intervals.value(index), 12);
  }
}

/**
 * An interval stack rooted on a specific pitch
 *
 * This is used for concrete scales and chords.
 */
export class PitchStack {
  /**
   * Constructor
   * @param {IntervalStack} intervals
   * @param {number} root Root note as an absolute pitch (e.g. C4)
   */
  constructor(intervals, root) {
    this.root = root;
    this.intervals = intervals;
  }

  get length() {
    return this.intervals.length;
  }

  /**
   * Get a ptich from the stack, starting from the root note and
   * going up the stack one by one.
   *
   * When the index is out of range, the result will be transposed
   * by the appropriate number of octaves
   * @param {number} index Index of pitch relative to the start note
   * @returns {number} An absolute pitch at the selected index
   */
  value(index) {
    return this.root + this.intervals.value(index);
  }
}
