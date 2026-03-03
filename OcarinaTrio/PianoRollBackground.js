import { Animated } from "../sketchlib/animation/Animated.js";
import { Color } from "../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { mod } from "../sketchlib/mod.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

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
    this.pitch_range = pitch_range;

    this.lines = style(
      [],
      new Style({
        stroke: Color.WHITE,
        width: 2,
      }),
    );
    this.primitive = group(this.lines);
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
