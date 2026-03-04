import { Animated } from "../sketchlib/animation/Animated.js";
import {
  binary_search,
  binary_search_range,
  compare_intervals_end,
  compare_intervals_start,
  CompareResult,
} from "../sketchlib/binary_search.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { AbsInterval } from "../sketchlib/music/AbsTimeline.js";
import { Note } from "../sketchlib/music/Music.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

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
    this.on_screen_duration = (HEIGHT - this.y) / this.velocity;

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
     * @type {RectPrimitive[]}
     */
    this.rects = [];
    this.primitive = style(this.rects, note_style);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    const t_max = time + this.on_screen_duration;

    // Only render the notes currently on screen
    const visible_rects = binary_search_range(this.all_rects, time, t_max).map(
      (x) => x.value,
    );

    this.rects.length = 0;
    this.rects.splice(0, Infinity, ...visible_rects);
  }
}
