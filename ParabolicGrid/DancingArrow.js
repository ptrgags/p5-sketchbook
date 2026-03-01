import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { Ease } from "../sketchlib/Ease.js";
import { N1, N16, N8D } from "../sketchlib/music/durations.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { VectorPrimitive } from "../sketchlib/primitives/VectorPrimitive.js";
import { Style } from "../sketchlib/Style.js";

const ANGLE_MAX = Math.PI / 2;
const ANGLE_3_4 = (3.0 * ANGLE_MAX) / 4.0;
const ANGLE_HALF = ANGLE_MAX / 2;
const ANGLE_1_4 = ANGLE_MAX / 4.0;
const ANGLE_SMALL = Math.PI / 32;

// animate back and forth between x (0 radians) and y (pi/2 radians)
const CURVE_ANGLE = LoopCurve.from_timeline(
  new Sequential(
    // Measure 0 =====================================================
    // For the 4 quarter notes, we're going to move from 90 degrees to 0, but
    // in a choppy bouncing motion like the ticking of an analog clock
    // beat 0 ----------------------------------------------------------
    // since we're starting from a hold, inout instead of out for the anticipation
    make_param(ANGLE_MAX, ANGLE_MAX + ANGLE_SMALL, N16, Ease.in_out_cubic),
    // move to the next angle, making a sharp hit
    make_param(ANGLE_MAX + ANGLE_SMALL, ANGLE_3_4, N8D, Ease.in_cubic),
    // beat 1 ----------------------------------------------------------
    // bounce back from sharp hit, which also serves as anticipation for the
    // next bounce.
    make_param(ANGLE_3_4, ANGLE_3_4 + ANGLE_SMALL, N16, Ease.out_cubic),
    make_param(ANGLE_3_4 + ANGLE_SMALL, ANGLE_HALF, N8D, Ease.in_cubic),
    // beat 2 ----------------------------------------------------------
    // same thing
    make_param(ANGLE_HALF, ANGLE_HALF + ANGLE_SMALL, N16, Ease.out_cubic),
    make_param(ANGLE_HALF + ANGLE_SMALL, ANGLE_1_4, N8D, Ease.in_cubic),
    // beat 3 ----------------------------------------------------------
    make_param(ANGLE_1_4, ANGLE_1_4 + ANGLE_SMALL, N16, Ease.out_cubic),
    // this time, land gracefully into the hold
    make_param(ANGLE_1_4 + ANGLE_SMALL, 0, N8D, Ease.in_out_cubic),
    // Measure 1 =======================================================
    // Hold for the x direction
    new Hold(N1),
    // Measure 2 ======================================================
    // Like Measure 0 but in the opposite direction
    // beat 0 ---------------------------------------------------------
    make_param(0, -ANGLE_SMALL, N16, Ease.in_out_cubic),
    make_param(-ANGLE_SMALL, ANGLE_1_4, N8D, Ease.in_cubic),
    // beat 1 ---------------------------------------------------------
    make_param(ANGLE_1_4, ANGLE_1_4 - ANGLE_SMALL, N16, Ease.out_cubic),
    make_param(ANGLE_1_4 - ANGLE_SMALL, ANGLE_HALF, N8D, Ease.in_cubic),
    // beat 2 ---------------------------------------------------------
    make_param(ANGLE_HALF, ANGLE_HALF - ANGLE_SMALL, N16, Ease.out_cubic),
    make_param(ANGLE_HALF - ANGLE_SMALL, ANGLE_3_4, N8D, Ease.in_cubic),
    // beat 3 ---------------------------------------------------------
    make_param(ANGLE_3_4, ANGLE_3_4 - ANGLE_SMALL, N16, Ease.out_cubic),
    make_param(ANGLE_3_4 - ANGLE_SMALL, ANGLE_MAX, N8D, Ease.in_out_cubic),
    // Measure 3 ======================================================
    // Hold for the y direction
    new Hold(N1),
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
