import { Animated } from "../sketchlib/animation/Animated.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { AbsInterval } from "../sketchlib/music/AbsTimeline.js";
import { Note } from "../sketchlib/music/Music.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

/**
 * @enum {number}
 */
const CompareResult = {
  LEFT: -1,
  MATCH: 0,
  RIGHT: 1,
};
Object.freeze(CompareResult);

/**
 * @template T
 * @param {T[]} arr
 * @param {number} start_index
 * @param {number} end_index
 * @param {number} key
 * @param {function(T, number): CompareResult} compare Function that compares the value with the current key and returns either
 * @returns {[number, T] | undefined} Either (index, value) if a match was found, or undefined if there was no match
 */
function binary_search(arr, start_index, end_index, key, compare) {
  if (end_index < start_index) {
    return undefined;
  }

  if (start_index === end_index) {
    const start_val = arr[start_index];
    const result = compare(arr[start_index], key);
    return result === CompareResult.MATCH
      ? [start_index, start_val]
      : undefined;
  }

  const mid_index = Math.floor((start_index + end_index) / 2);
  const val_mid = arr[mid_index];

  const result = compare(val_mid, key);
  if (result === CompareResult.MATCH) {
    return [mid_index, val_mid];
  } else if (result === CompareResult.LEFT) {
    return binary_search(arr, start_index, mid_index, key, compare);
  } else {
    return binary_search(arr, mid_index, end_index, key, compare);
  }
}

/**
 * @template T
 * @param {AbsInterval<T>[]} intervals
 * @param {number} start_time
 * @param {number} end_time
 * @returns {AbsInterval<T>[]}
 */
function select_intervals(intervals, start_time, end_time) {
  const start_result = binary_search(
    intervals,
    0,
    intervals.length - 1,
    start_time,
    (interval, t) => {
      if (t < interval.start_time.real) {
        return CompareResult.LEFT;
      }

      if (t >= interval.end_time.real) {
        return CompareResult.RIGHT;
      }

      return CompareResult.MATCH;
    },
  );
  const end_result = binary_search(
    intervals,
    0,
    intervals.length - 1,
    end_time,
    (interval, t) => {
      if (t <= interval.start_time.real) {
        return CompareResult.LEFT;
      }

      if (t > interval.end_time.real) {
        return CompareResult.RIGHT;
      }

      return CompareResult.MATCH;
    },
  );

  if (!start_result && !end_result) {
    // nothing in the selected range
    return [];
  }

  if (!start_result && end_result) {
    const [end_index] = end_result;
    return intervals.slice(0, end_index + 1);
  }

  if (start_result && !end_result) {
    const [start_index] = start_result;
    return intervals.slice(start_index);
  }

  const [start_index] = start_result;
  const [end_index] = end_result;

  return intervals.slice(start_index, end_index + 1);
}

/**
 * @implements {Animated}
 */
export class PianoRoll {
  /**
   * Constructor
   * @param {AbsInterval<Note>[]} notes
   * @param {number} y
   * @param {number} velocity
   * @param {[number, number]} pitch_range
   * @param {Style} note_style
   */
  constructor(notes, y, velocity, pitch_range, note_style) {
    this.y = y;
    this.velocity = velocity;
    const [min_pitch, max_pitch] = pitch_range;
    const num_columns = max_pitch - min_pitch + 1;
    const column_width = WIDTH / num_columns;

    this.all_rects = notes.map((interval) => {
      const pitch = interval.value.pitch;
      const x = (pitch - min_pitch) * column_width;
      const height = interval.duration.real * velocity;
      const rect = new RectPrimitive(
        new Point(x, this.y),
        new Direction(column_width, height),
      );

      return new AbsInterval(rect, interval.start_time, interval.end_time);
    });

    /**
     * @type {}
     */
    this.rects = [];
    this.primitive = style(this.rects, note_style);
  }

  update(time) {
    const t_max = (HEIGHT - this.y) * this.velocity;

    // Only render the notes currently on screen
    const visible_rects = select_intervals(this.rects, time, t_max).map(
      (x) => x.value,
    );

    this.rects.length = 0;
    this.rects.splice(0, Infinity, visible_rects);
  }
}
