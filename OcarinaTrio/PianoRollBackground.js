import { make_stripes } from "../AnimatedTangle/patterns/stripes.js";
import { Animated } from "../sketchlib/animation/Animated.js";
import { Color } from "../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { mod } from "../sketchlib/mod.js";
import { MIDIPitch } from "../sketchlib/music/MIDIPitch.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

const COLUMN_STYLES = [
  new Style({ fill: new Oklch(0.3, 0, 0) }),
  new Style({ fill: new Oklch(0.2, 0, 0) }),
];
const COLUMN_STYLE_INDICES = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];

/**
 * @implements {Animated}
 */
export class PianoRollBackground {
  /**
   * Constructor
   * @param {number} y y-value of top of pinao roll
   * @param {number} velocity Velocity in px/measure
   * @param {[number, number]} pitch_range range of pitches
   */
  constructor(y, velocity, pitch_range) {
    this.y = y;
    this.velocity = velocity;
    const [min_pitch, max_pitch] = pitch_range;
    const num_columns = max_pitch - min_pitch + 1;
    const column_width = WIDTH / num_columns;

    // Draw a tall rectangle for each pitch
    const columns = [];
    const pitch_lines = [];
    for (let i = min_pitch; i <= max_pitch; i++) {
      const x = (i - min_pitch) * column_width;
      const pitch_class = MIDIPitch.get_pitch_class(i);
      const top_left = new Point(x, this.y);
      const rect = new RectPrimitive(
        top_left,
        new Direction(column_width, HEIGHT - this.y),
      );
      const style_index = COLUMN_STYLE_INDICES[pitch_class];
      const col_style = COLUMN_STYLES[style_index];
      columns.push(style(rect, col_style));

      // also push a vertical line to separate the keys
      pitch_lines.push(
        new LineSegment(new Point(x, this.y), new Point(x, HEIGHT)),
      );
    }

    this.beat_lines = style(
      [],
      new Style({
        stroke: new Oklch(0.8, 0, 0),
        width: 2,
      }),
    );

    this.bar_lines = style(
      [],
      new Style({
        stroke: Color.WHITE,
        width: 2,
      }),
    );
    this.primitive = group(
      ...columns,
      ...pitch_lines,
      this.beat_lines,
      this.bar_lines,
    );
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    const lines = [];
    const t_first_line = 1.0 - mod(time, 1.0);
    const y_first_line = this.y + this.velocity * t_first_line;
    for (let y = y_first_line; y < HEIGHT; y += this.velocity) {
      lines.push(new LineSegment(new Point(0, y), new Point(WIDTH, y)));
    }

    this.bar_lines.regroup(...lines);

    const beat_lines = [];
    // t is an integer, mod(t, 1) gives [0, 1]
    // mod(4t, 1) gives [0, 1] but 4 times as often
    const t_first_beat_line = 1.0 - mod(4 * time, 1.0);
    const y_first_beat_line = this.y + (this.velocity / 4) * t_first_beat_line;
    for (let y = y_first_beat_line; y < HEIGHT; y += this.velocity / 4) {
      beat_lines.push(new LineSegment(new Point(0, y), new Point(WIDTH, y)));
    }

    this.beat_lines.regroup(...beat_lines);
  }
}
