import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import {
  Hold,
  make_param,
  ParamCurve,
} from "../sketchlib/animation/ParamCurve.js";
import { Ease } from "../sketchlib/Ease.js";
import { N1, N16, N32, N4, N8 } from "../sketchlib/music/durations.js";
import { Sequential, TimeInterval } from "../sketchlib/music/Timeline.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { VectorPrimitive } from "../sketchlib/primitives/VectorPrimitive.js";
import { Rational } from "../sketchlib/Rational.js";
import { Style } from "../sketchlib/Style.js";

const ANGLE_MAX = Math.PI / 2;
const ANGLE_3_4 = (3.0 * ANGLE_MAX) / 4.0;
const ANGLE_HALF = ANGLE_MAX / 2;
const ANGLE_1_4 = ANGLE_MAX / 4.0;
const ANGLE_SMALL = Math.PI / 32;
const EASE = Ease.out_in_cubic;

/**
 * Animate a fluctuation from a center value
 * @param {number} center_value Value to hold at the start and end
 * @param {number} anticipate_value Value at the peak of the anticipation phase (opposite the direction of desired motion)
 * @param {number} followthrough_value Value at the peak of the followthrough phase (overshooting the center value)
 * @param {Rational} anticipate_duration How long to to wind up before the drop
 * @param {Rational} drop_duration How long the drop (the main forward motion... idk what to call that) is.
 * @param {Rational} followthrough_duration How long the followthrough should be
 * @returns {TimeInterval<ParamCurve>[]} [windup, drop, followthrough]. The curve will hit the center value at time anticipation_duration + 1/2 drop_duration
 */
function fluctuate(
  center_value,
  anticipate_value,
  followthrough_value,
  anticipate_duration,
  drop_duration,
  followthrough_duration,
) {
  const anticipate = make_param(
    center_value,
    anticipate_value,
    anticipate_duration,
    Ease.in_out_cubic,
  );
  const drop = make_param(
    anticipate_value,
    followthrough_value,
    drop_duration,
    Ease.in_out_cubic,
  );
  const followthrough = make_param(
    followthrough_value,
    center_value,
    followthrough_duration,
    Ease.in_out_cubic,
  );
  return [anticipate, drop, followthrough];
}

/**
 * Make one of the bounces in the animation.
 * @param {number} start_value Initial value
 * @param {number} stop_value Final value
 * @param {number} anticipate_amount How much to subtract from the start value in the anticipate
 * @param {Rational} anticipate_duration Duration for the anticipation duration
 * @param {Rational} act_duration Duration of the act duration
 * @param {boolean} start_at_rest If true, the easing at the start of the curve is more graceful
 * @returns {TimeInterval<ParamCurve>[]}
 */
function bounce(
  start_value,
  stop_value,
  anticipate_amount,
  anticipate_duration,
  act_duration,
  start_at_rest,
) {
  const anticipate = make_param(
    start_value,
    start_value - anticipate_amount,
    anticipate_duration,
    start_at_rest ? Ease.in_out_cubic : Ease.out_cubic,
  );
  const act = make_param(
    start_value - anticipate_amount,
    stop_value,
    act_duration,
    Ease.in_cubic,
  );
  return [anticipate, act];
}

// animate back and forth between x (0 radians) and y (pi/2 radians)
const CURVE_ANGLE = LoopCurve.from_timeline(
  new Sequential(
    // Measure 0 =====================================================
    // For the 4 quarter notes, we're going to move from 90 degrees to 0, but
    // in a choppy bouncing motion like the ticking of an analog clock
    ...bounce(ANGLE_MAX, ANGLE_3_4, -ANGLE_SMALL, N16, new Rational(3, 16)),
    ...bounce(ANGLE_3_4, ANGLE_HALF, -ANGLE_SMALL, N16, new Rational(3, 16)),
    ...bounce(ANGLE_HALF, ANGLE_1_4, -ANGLE_SMALL, N16, new Rational(3, 16)),
    ...bounce(ANGLE_1_4, 0, -ANGLE_SMALL, N16, new Rational(3, 16)),
    // Measure 1 =======================================================
    // We have to bounce from the previous measure's motion
    make_param(0, ANGLE_SMALL, N16, Ease.out_cubic),
    // Come back to rest, as if damped
    make_param(ANGLE_SMALL, 0, N16, Ease.in_out_cubic),
    // Hold
    new Hold(new Rational(7, 8)),
    // Measure 2 ======================================================
    // Like Measure 0, but now we tick the other direction from 0 to 90 degrees
    ...bounce(0, ANGLE_1_4, ANGLE_SMALL, N16, new Rational(3, 16)),
    ...bounce(ANGLE_1_4, ANGLE_HALF, ANGLE_SMALL, N16, new Rational(3, 16)),
    ...bounce(ANGLE_HALF, ANGLE_3_4, ANGLE_SMALL, N16, new Rational(3, 16)),
    ...bounce(ANGLE_3_4, ANGLE_MAX, ANGLE_SMALL, N16, new Rational(3, 16)),
    // Measure 3 ======================================================
    // Like Measure 1, but the other direction
    make_param(ANGLE_MAX, ANGLE_MAX - ANGLE_SMALL, N16, Ease.out_cubic),
    make_param(ANGLE_MAX - ANGLE_SMALL, ANGLE_MAX, N16, Ease.in_out_cubic),
    new Hold(new Rational(7, 8)),
    /*
  new Sequential(
    // start of loop or transition from y to x
    make_param(ANGLE_MAX, ANGLE_3_4, N4),
    make_param(ANGLE_3_4, ANGLE_HALF, N4, EASE),
    make_param(ANGLE_HALF, ANGLE_1_4, N4, EASE),
    make_param(ANGLE_1_4, 0, N4, EASE),
    // x is animating, hold at 0
    //  |x...x...x...x...| 1/16
    //
    // Fluctuations happen
    // ~|~..~~..~~..~~..~|~
    new Hold(new Rational(3, 16).sub(N32)),
    ...fluctuate(0, -ANGLE_SMALL, ANGLE_SMALL, N32, N16, N32),
    new Hold(N8),
    ...fluctuate(0, -2 * ANGLE_SMALL, 2 * ANGLE_SMALL, N32, N16, N32),
    new Hold(N8),
    ...fluctuate(0, -3 * ANGLE_SMALL, 3 * ANGLE_SMALL, N32, N16, N32),
    new Hold(new Rational(3 / 16).add(N32)),
    // transition from x to y
    make_param(0, ANGLE_1_4, N4, EASE),
    make_param(ANGLE_1_4, ANGLE_HALF, N4, EASE),
    make_param(ANGLE_HALF, ANGLE_3_4, N4, EASE),
    make_param(ANGLE_3_4, ANGLE_MAX, N4, EASE),
    // y is animating, hold at pi/2
    new Hold(N1),
  ),
  */
  ),
);

const COLOR_FILL = new Oklch(0.7433, 0.1036, 181.06);
const COLOR_DARKER = COLOR_FILL.adjust_lightness(-0.15);

const STYLE_CIRCLE = new Style({
  fill: COLOR_FILL,
  stroke: COLOR_DARKER,
  width: 4,
});
const STYLE_ARROW = new Style({
  stroke: COLOR_DARKER,
  width: 4,
});

/**
 * Make an arrow that points in the direction of translation, but animates
 * to the beat.
 *
 * @implements {Animated}
 */
export class DancingArrow {
  /**
   * Constructor
   * @param {Circle} circle The boundary circle to set the size of the arrow.
   */
  constructor(circle) {
    this.circle = circle;
    this.arrow_radius = 0.75 * circle.radius;
    this.arrow = new VectorPrimitive(Point.ORIGIN, Point.ORIGIN);
    this.primitive = group(
      style(this.circle, STYLE_CIRCLE),
      style(this.arrow, STYLE_ARROW),
    );
  }

  /**
   * Update
   * @param {number} time Time in measures of 4/4
   */
  update(time) {
    const angle = CURVE_ANGLE.value(time);

    // The animations are plotted y-up using CGA transforms.
    // This animation doesn't, so we need to flip y by reversing
    // the angle.
    const forward = Direction.from_angle(-angle);

    const offset = forward.scale(this.arrow_radius);

    this.arrow.tip = this.circle.center.add(offset);
    this.arrow.tail = this.circle.center.add(offset.neg());
  }
}
