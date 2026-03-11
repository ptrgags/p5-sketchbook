import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { Color } from "../sketchlib/Color.js";
import { N1 } from "../sketchlib/music/durations.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

const CURVE_INTERPOLATION = LoopCurve.from_timeline(
  new Sequential(
    new Hold(N1),
    make_param(0, 1, N1),
    new Hold(N1),
    make_param(1, 0, N1),
  ),
);

const STYLE_PARALLELS = new Style({ stroke: Color.RED });

/**
 * @implements {Animated}
 */
export class ExpandCollapseParallels {
  /**
   * Constructor
   * @param {number} scale_factor
   * @param {number} max_power
   * @param {CVersor} to_screen
   */
  constructor(scale_factor, max_power, to_screen) {
    this.scale_factor = scale_factor;
    this.max_power = max_power;

    this.to_screen = to_screen;

    this.primitive = style([], STYLE_PARALLELS);
  }

  update(time) {
    const t = CURVE_INTERPOLATION.value(time);
    const scale = CVersor.dilation(Math.pow(this.scale_factor, t));
    const iterator = new PowerIterator(scale);

    const parallels = iterator
      .iterate(-this.max_power, this.max_power)
      .map((x) => this.to_screen.compose(x).transform(Cline.UNIT_CIRCLE));

    this.primitive.regroup(...parallels);
  }
}
