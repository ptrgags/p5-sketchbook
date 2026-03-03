import { Animated } from "../sketchlib/animation/Animated.js";
import { Color } from "../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { mod } from "../sketchlib/mod.js";
import { MIDIPitch } from "../sketchlib/music/MIDIPitch.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

const COLUMN_STYLES = [
  new Style({ fill: new Oklch(1.0, 0, 0, 0.5) }),
  new Style({ fill: new Oklch(0.5, 0, 0, 0.5) }),
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

    const columns = [];
    for (let i = min_pitch; i <= max_pitch; i++) {
      const x = (i - min_pitch) * column_width;
      const pitch_class = MIDIPitch.get_pitch_class(i);
      const rect = new RectPrimitive(
        new Point(x, this.y),
        new Direction(column_width, HEIGHT - this.y),
      );
      const style_index = COLUMN_STYLE_INDICES[pitch_class];
      const col_style = COLUMN_STYLES[style_index];
      columns.push(style(rect, col_style));
    }

    this.lines = style(
      [],
      new Style({
        stroke: Color.WHITE,
        width: 2,
      }),
    );
    this.primitive = group(...columns, this.lines);
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
      lines.push(new LinePrimitive(new Point(0, y), new Point(WIDTH, y)));
    }

    this.lines.primitives.length = 0;
    this.lines.primitives.splice(0, Infinity, ...lines);
  }
}
