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
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { style } from "../sketchlib/primitives/shorthand.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
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
      const y = interval.start_time.real * velocity;
      const height = interval.duration.real * velocity;
      const rect = new RectPrimitive(
        new Point(x, y),
        new Direction(column_width, height),
      );

      return new AbsInterval(rect, interval.start_time, interval.end_time);
    });

    /**
     * @type {RectPrimitive[]}
     */
    this.rects = [];
    this.translation = new Transform(Direction.ZERO);
    this.primitive = new GroupPrimitive(this.rects, {
      style: note_style,
      transform: this.translation,
    });
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    const t_max = time + this.on_screen_duration;

    // Only render the notes currently on screen
    //20.1294375
    //25.6294375
    const visible_rects = binary_search_range(this.all_rects, time, t_max).map(
      (x) => x.value,
    );

    this.rects.length = 0;
    this.rects.splice(0, Infinity, ...visible_rects);

    const distance_traveled = time * this.velocity;
    this.translation.translation = new Direction(0, this.y - distance_traveled);
  }
}
