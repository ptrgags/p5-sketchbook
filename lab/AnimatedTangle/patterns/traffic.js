import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Ease } from "../../../sketchlib/Ease.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { RectPrimitive } from "../../../sketchlib/primitives/RectPrimitive.js";
import {
  group,
  style,
  xform,
} from "../../../sketchlib/primitives/shorthand.js";
import { Transform } from "../../../sketchlib/primitives/Transform.js";
import { Style } from "../../../sketchlib/Style.js";
import { Animated } from "../../lablib/animation/Animated.js";
import { AnimationGroup } from "../../lablib/animation/AnimationGroup.js";
import { LoopCurve } from "../../lablib/animation/LoopCurve.js";
import { ParamCurve } from "../../lablib/animation/ParamCurve.js";
import { Sequential } from "../../lablib/music/Timeline.js";
import { Rational } from "../../lablib/Rational.js";
import {
  PALETTE_CORAL,
  PALETTE_NAVY,
  PALETTE_SKY,
  Values,
} from "../theme_colors.js";

const HALF_DIST = 300;
const HALF_DURATION = new Rational(2);
const TIMELINE_POSITION = new Sequential(
  // Enter from the left, slowing down when we reach the center of motion
  new ParamCurve(-HALF_DIST, 0, HALF_DURATION, Ease.out_cubic),
  // Leave to the right, speeding up from rest
  new ParamCurve(0, HALF_DIST, HALF_DURATION, Ease.in_cubic)
);
const CURVE_POSITION = LoopCurve.from_timeline(TIMELINE_POSITION);

const BOX_BACKGROUND = new RectPrimitive(Point.ORIGIN, new Direction(25, 25));
const STYLE_BOX = new Style({
  fill: PALETTE_CORAL[Values.MedLight],
});

const STYLE_BOX_STRIPES = new Style({
  fill: PALETTE_CORAL[Values.Dark],
});
const BOX_STRIPE = new RectPrimitive(
  new Point(0, 25 / 2),
  new Direction(25, 25 / 2)
);

const BOX = group(
  style(BOX_BACKGROUND, STYLE_BOX),
  style(BOX_STRIPE, STYLE_BOX_STRIPES)
);

// This should always be odd so one box sits exactly in the center
const NUM_BOXES = 11;
const PHASES = new Array(NUM_BOXES).fill(0).map((_, i) => {
  const t_step = TIMELINE_POSITION.duration.real / (NUM_BOXES - 1);
  return i * t_step;
});

/**
 * @implements {Animated}
 */
class TrafficLane {
  /**
   *
   * @param {Direction} center_offset
   */
  constructor(center_offset) {
    this.center_offset = center_offset;

    this.transforms = PHASES.map((phase) => {
      const dx = CURVE_POSITION.value(phase);
      return new Transform(center_offset.add(Direction.DIR_X.scale(dx)));
    });

    this.primitive = group(...this.transforms.map((t) => xform(BOX, t)));
  }

  update(time) {
    this.transforms.forEach((t, i) => {
      const dx = CURVE_POSITION.value(time + PHASES[i]);
      t.translation = this.center_offset.add(Direction.DIR_X.scale(dx));
    });
  }
}

const LANES = [
  new Direction(250, 100),
  new Direction(200, 125),
  new Direction(150, 150),
  new Direction(100, 175),
].map((x) => new TrafficLane(x));

export const TRAFFIC = new AnimationGroup(...LANES);
