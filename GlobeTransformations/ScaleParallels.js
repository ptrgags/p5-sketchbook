import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { N1 } from "../sketchlib/music/durations.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { group } from "../sketchlib/primitives/shorthand.js";

const CURVE_SCALE = LoopCurve.from_timeline(
  new Sequential(
    new Hold(N1),
    make_param(0, 1, N1),
    new Hold(N1),
    make_param(1, 0, N1),
  ),
);

/**
 * @implements {Animated}
 */
export class ScaleParallels {
  /**
   *
   * @param {number} scale_factor
   * @param {number} max_power
   * @param {CVersor} to_screen
   */
  constructor(scale_factor, max_power, to_screen) {
    this.scale_factor = scale_factor;
    this.to_screen = to_screen;
    const scale = CVersor.dilation(scale_factor);
    const iterator = new PowerIterator(scale);
    this.parallels = iterator.iterate(-max_power, max_power).map((x) => {
      return x.transform(Cline.UNIT_CIRCLE);
    });
    this.parallels_screen = this.parallels.map((parallel) =>
      to_screen.transform(parallel),
    );

    this.primitive = group();
  }

  update(time) {
    const t = CURVE_SCALE.value(time);
    const animated_scale = CVersor.dilation(Math.pow(this.scale_factor, t));
    const xform = this.to_screen.compose(animated_scale);

    const transformed_parallels = this.parallels.map((x) => {
      return xform.transform(x);
    });

    this.primitive.regroup(...this.parallels_screen, ...transformed_parallels);
  }
}
