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
   *
   * Note that if the interval stack spans more than an octave,
   * @param {number} index Index into the intervals list.
   */
  value(index) {
    // The signed scale degree may be out of range, this just means
    // up or down a number of octaves. For example, for a 7-note scale,
    // -1 is the last note in the scale but down an octave (-1 = -1 * 7 + 6)
    // 9 is the third note in the scale but up an octave (9 = 1 * 7 + 2)
    const octaves = Math.floor(index / this.intervals.length);
    const reduced_index = mod(index, this.intervals.length);

    return octaves * P8 + this.intervals[reduced_index];
  }
}
