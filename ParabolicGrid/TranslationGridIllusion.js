import { Animated } from "../sketchlib/animation/Animated.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { STYLE_X, STYLE_Y } from "./styling.js";
import { CURVE_X, CURVE_Y } from "./timing.js";

const OFFSET_X = new Direction(0.25, 0);
const OFFSET_Y = new Direction(0, 0.25);

const MAX_X_STEP = 5;
const X_ITER = new PowerIterator(CVersor.translation(OFFSET_X));
const X_LINES = new CTile(
  ...X_ITER.iterate(-MAX_X_STEP, MAX_X_STEP).map((x) =>
    x.transform(Cline.Y_AXIS),
  ),
);

const MAX_Y_STEP = 7;
const Y_ITER = new PowerIterator(CVersor.translation(OFFSET_Y));
const Y_LINES = new CTile(
  ...Y_ITER.iterate(-MAX_Y_STEP, MAX_Y_STEP).map((x) =>
    x.transform(Cline.X_AXIS),
  ),
);

/**
 * Translation grid illusion, analagous to the parabolic case.
 *
 * The animation does a simiar illusion. Though this time, the hidden jump
 * in lines happens just outside the bounds of the screen.
 * @see ParabolicGridIllusion
 * @implements {Animated}
 */
export class TranslationGridIllusion {
  /**
   * Constructor
   * @param {CVersor} to_screen Transformation from the unit circle to a larger screen space circle
   */
  constructor(to_screen) {
    this.to_screen = to_screen;

    this.x_group = style(X_LINES, STYLE_X);
    this.y_group = style(Y_LINES, STYLE_Y);
    this.primitive = group(this.x_group, this.y_group);
  }

  /**
   * Update the animation
   * @param {number} time
   */
  update(time) {
    const tx = CURVE_X.value(time);
    const ty = CURVE_Y.value(time);

    // Since T(d1) * T(d2) = T(d1 + d2), we can get away
    // with computing the offset without having to do a bunch
    // of CGA operations.
    const offset = new Direction(OFFSET_X.x * tx, OFFSET_Y.y * ty);
    const translate = CVersor.translation(offset);
    const para_screen = this.to_screen.compose(translate);

    this.x_group.regroup(para_screen.transform(X_LINES));
    this.y_group.regroup(para_screen.transform(Y_LINES));
  }
}
