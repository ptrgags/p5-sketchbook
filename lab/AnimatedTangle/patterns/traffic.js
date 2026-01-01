import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Ease } from "../../../sketchlib/Ease.js";
import { RectPrimitive } from "../../../sketchlib/primitives/RectPrimitive.js";
import { group, xform } from "../../../sketchlib/primitives/shorthand.js";
import { Transform } from "../../../sketchlib/primitives/Transform.js";
import { AnimationCurve } from "../../lablib/animation/AnimationCurve.js";
import { LoopCurve } from "../../lablib/animation/LoopCurve.js";
import { ParamCurve } from "../../lablib/animation/ParamCurve.js";
import { Sequential } from "../../lablib/music/Timeline.js";
import { Rational } from "../../lablib/Rational.js";

const HALF_DIST = 300;
const HALF_DURATION = new Rational(1, 2);
const POSITION = new Sequential(
  // Enter from the left, slowing down when we reach the center of motion
  new ParamCurve(-HALF_DIST, 0, HALF_DURATION, Ease.out_cubic),
  // Leave to the right, speeding up from rest
  new ParamCurve(0, HALF_DIST, HALF_DURATION, Ease.in_cubic)
);
const CURVE_POSITION = new LoopCurve(AnimationCurve.from_timeline(POSITION));

const BOX = new RectPrimitive(Point.ORIGIN, new Direction(25, 25));

class TrafficLane {
  /**
   *
   * @param {Direction} center_offset
   */
  constructor(center_offset) {
    this.center_offset = center_offset;
    this.translation = new Transform(center_offset);
    this.primitive = xform(BOX, this.translation);
  }

  update(time) {
    const dx = CURVE_POSITION.value(time);
    this.translation.translation = this.center_offset.add(
      Direction.DIR_X.scale(dx)
    );
  }

  render() {
    return this.primitive;
  }
}

class Traffic {
  /**
   *
   * @param {Direction[]} center_offsets
   */
  constructor(...center_offsets) {
    this.lanes = center_offsets.map((x) => new TrafficLane(x));
    this.primitive = group(...this.lanes.map((x) => x.render()));
  }

  update(time) {
    this.lanes.forEach((x) => {
      x.update(time);
    });
  }

  render() {
    return this.primitive;
  }
}

export const TRAFFIC = new Traffic(
  new Direction(250, 100),
  new Direction(250, 125),
  new Direction(250, 150),
  new Direction(250, 175)
);
