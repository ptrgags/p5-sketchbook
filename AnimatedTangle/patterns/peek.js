import { AnimationCurves } from "../../lab/lablib/animation/AnimationCurves.js";
import { ParamCurve } from "../../lab/lablib/animation/ParamCurve.js";
import { Gap, Sequential } from "../../lab/lablib/music/Timeline.js";
import { Rational } from "../../lab/lablib/Rational.js";
import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { GooglyEye } from "../../sketchlib/primitives/GooglyEye.js";

const SCLERA_RADIUS = 20;
const PUPIL_RADIUS = 10;

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
    this.angle_offset = Math.atan2(direction.y, direction.x);

    this.eye = new GooglyEye(
      start_point,
      direction,
      SCLERA_RADIUS,
      PUPIL_RADIUS
    );
  }

  /**
   *
   * @param {AnimationCurves} curves
   */
  update(curves) {
    const position_t = curves.get_curve_val("peek_pos") ?? 0;
    const position = Point.lerp(this.start_point, this.end_point, position_t);

    const angle = curves.get_curve_val("peek_angle") ?? 0;

    const direction = this.eye.update(position, Direction.from_angle(angle));
  }

  /**
   * @param {Rational} duration Duration of the whole animation in seconds
   * @returns {{[curve_id: string]: import("../../lab/lablib/music/Timeline").Timeline<ParamCurve>}}
   */
  make_curves(duration) {
    // 1 second per frame
    const DURATION_FRAME = new Rational(1);

    const position = new Sequential(
      // move from start -> end
      new ParamCurve(0, 1, DURATION_FRAME),
      // stay in place while turning
      new ParamCurve(1, 1, DURATION_FRAME),
      // return to start
      new ParamCurve(1, 0, DURATION_FRAME),
      // stay in place while turning
      new ParamCurve(0, 0, DURATION_FRAME)
    );

    const angle = new Sequential(
      // Look in the direction from start -> end
      new ParamCurve(this.angle_offset, this.angle_offset, DURATION_FRAME),
      // Rotate CCW back towards start
      new ParamCurve(
        this.angle_offset,
        this.angle_offset + Math.PI,
        DURATION_FRAME
      ),
      new ParamCurve(
        this.angle_offset + Math.PI,
        this.angle_offset + Math.PI,
        DURATION_FRAME
      ),
      // Rotate CCW towards end
      new ParamCurve(
        this.angle_offset + Math.PI,
        this.angle_offset + 2 * Math.PI,
        DURATION_FRAME
      )
      // End of the loop, we jump from angle + 2pi to angle, which are
      // equivalent
    );

    return {
      peek_pos: Sequential.from_loop(position, duration),
      peek_angle: Sequential.from_loop(angle, duration),
    };
  }
}

const POINT_A = new Point(100, 400);
const POINT_B = new Point(100 + 50, 400 - 50);
export const EYE = new PeekingEye(POINT_A, POINT_B);
