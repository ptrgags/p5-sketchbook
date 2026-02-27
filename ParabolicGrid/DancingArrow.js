import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { N1 } from "../sketchlib/music/durations.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { VectorPrimitive } from "../sketchlib/primitives/VectorPrimitive.js";
import { Style } from "../sketchlib/Style.js";

// animate back and forth between x (0 radians) and y (pi/2 radians)
const CURVE_ANGLE = LoopCurve.from_timeline(
  new Sequential(
    // start of loop or transition from y to x
    make_param(Math.PI / 2, 0, N1),
    // x is animating, hold at 0
    new Hold(N1),
    // transition from x to y
    make_param(0, Math.PI / 2, N1),
    // y is animating, hold at pi/2
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
