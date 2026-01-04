import { Hold, ParamCurve } from "../../lablib/animation/ParamCurve.js";
import { Sequential } from "../../lablib/music/Timeline.js";
import { Rational } from "../../lablib/Rational.js";
import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { GooglyEye } from "../../../sketchlib/primitives/GooglyEye.js";
import { AnimationCurve } from "../../lablib/animation/AnimationCurve.js";
import { LoopCurve } from "../../lablib/animation/LoopCurve.js";

const SCLERA_RADIUS = 20;
const PUPIL_RADIUS = 10;

// 1 second per frame
const DURATION_FRAME = new Rational(1);

const TIMELINE_POSITION = new Sequential(
  // move from start -> end
  new ParamCurve(0, 1, DURATION_FRAME),
  // stay in place while turning
  new ParamCurve(1, 1, DURATION_FRAME),
  // return to start
  new ParamCurve(1, 0, DURATION_FRAME),
  // stay in place while turning
  new ParamCurve(0, 0, DURATION_FRAME)
);
const CURVE_POSITION = new LoopCurve(
  AnimationCurve.from_timeline(TIMELINE_POSITION)
);

const TIMELINE_ANGLE = new Sequential(
  // Look in the direction from start -> end
  new Hold(DURATION_FRAME),
  // Rotate CCW back towards start
  new ParamCurve(0, Math.PI, DURATION_FRAME),
  new Hold(DURATION_FRAME),
  // Rotate CCW towards end
  new ParamCurve(Math.PI, 2 * Math.PI, DURATION_FRAME)
  // End of the loop, we jump from angle + 2pi to angle, which are
  // equivalent
);
const CURVE_ANGLE = new LoopCurve(AnimationCurve.from_timeline(TIMELINE_ANGLE));

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

    this.eye = new GooglyEye(
      start_point,
      direction,
      SCLERA_RADIUS,
      PUPIL_RADIUS
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
    this.eye.update(position, Direction.from_angle(angle));
  }
}

const POINT_A = new Point(225, 375);
const POINT_B = new Point(275, 325);
export const EYE = new PeekingEye(POINT_A, POINT_B);
