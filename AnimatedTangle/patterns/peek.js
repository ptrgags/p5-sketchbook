import {
  Hold,
  make_param,
  ParamCurve,
} from "../../sketchlib/animation/ParamCurve.js";
import { Sequential } from "../../sketchlib/music/Timeline.js";
import { Rational } from "../../sketchlib/Rational.js";
import { Direction } from "../../sketchlib/pga2d/Direction.js";
import { Point } from "../../sketchlib/pga2d/Point.js";
import { GooglyEye } from "../../sketchlib/primitives/GooglyEye.js";
import { AnimationCurve } from "../../sketchlib/animation/AnimationCurve.js";
import { LoopCurve } from "../../sketchlib/animation/LoopCurve.js";
import { Animated } from "../../sketchlib/animation/Animated.js";

const SCLERA_RADIUS = 20;
const PUPIL_RADIUS = 10;

// 1 second per frame
const DURATION_FRAME = new Rational(1);

const CURVE_POSITION = LoopCurve.from_timeline(
  new Sequential(
    // move from start -> end
    make_param(0, 1, DURATION_FRAME),
    // stay in place while turning
    make_param(1, 1, DURATION_FRAME),
    // return to start
    make_param(1, 0, DURATION_FRAME),
    // stay in place while turning
    make_param(0, 0, DURATION_FRAME),
  ),
);

const CURVE_ANGLE = LoopCurve.from_timeline(
  new Sequential(
    // Look in the direction from start -> end
    new Hold(DURATION_FRAME),
    // Rotate CCW back towards start
    make_param(0, Math.PI, DURATION_FRAME),
    new Hold(DURATION_FRAME),
    // Rotate CCW towards end
    make_param(Math.PI, 2 * Math.PI, DURATION_FRAME),
    // End of the loop, we jump from angle + 2pi to angle, which are
    // equivalent
  ),
);

/**
 * @implements {Animated}
 */
class PeekingEye {
  /**
   *
   * @param {Point} start_point First point
   * @param {Point} end_point Second point
   */
  constructor(start_point, end_point) {
    this.start_point = start_point;
    this.end_point = end_point;

    const direction = end_point.sub(this.start_point).normalize();
    this.start_angle = Math.atan2(direction.y, direction.x);

    this.primitive = new GooglyEye(
      start_point,
      direction,
      SCLERA_RADIUS,
      PUPIL_RADIUS,
    );
  }

  /**
   *
   * @param {number} time Animation time
   */
  update(time) {
    const position_t = CURVE_POSITION.value(time);
    const position = Point.lerp(this.start_point, this.end_point, position_t);

    const angle = this.start_angle + CURVE_ANGLE.value(time);
    this.primitive.update(position, Direction.from_angle(angle));
  }
}

const POINT_A = new Point(225, 375);
const POINT_B = new Point(275, 325);
export const EYE = new PeekingEye(POINT_A, POINT_B);
