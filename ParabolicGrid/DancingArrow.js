import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { N1 } from "../sketchlib/music/durations.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { VectorPrimitive } from "../sketchlib/primitives/VectorPrimitive.js";

// animate back and forth between x (0 radians) and y (pi/2 radians)
const CURVE_ANGLE = LoopCurve.from_timeline(
  new Sequential(
    new Hold(N1),
    make_param(0, Math.PI / 2, N1),
    new Hold(N1),
    make_param(Math.PI / 2, 0, N1),
  ),
);

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
    this.primitive = group(this.circle, this.arrow);
  }

  update(time) {
    const angle = CURVE_ANGLE.value(time);
    const forward = Direction.from_angle(angle);

    const offset = forward.scale(this.arrow_radius);

    this.arrow.tip = this.circle.center.add(offset);
    this.arrow.tail = this.circle.center.add(offset.neg());
  }
}
