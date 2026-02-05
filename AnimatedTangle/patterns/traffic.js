import { Direction } from "../../sketchlib/pga2d/Direction.js";
import { Point } from "../../sketchlib/pga2d/Point.js";
import { Ease } from "../../sketchlib/Ease.js";
import { Circle } from "../../sketchlib/primitives/Circle.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { RectPrimitive } from "../../sketchlib/primitives/RectPrimitive.js";
import { group, style, xform } from "../../sketchlib/primitives/shorthand.js";
import { Transform } from "../../sketchlib/primitives/Transform.js";
import { Style } from "../../sketchlib/Style.js";
import { Animated } from "../../sketchlib/animation/Animated.js";
import { AnimationGroup } from "../../sketchlib/animation/AnimationGroup.js";
import { LoopCurve } from "../../sketchlib/animation/LoopCurve.js";
import {
  make_param,
  ParamCurve,
} from "../../sketchlib/animation/ParamCurve.js";
import { Sequential } from "../../sketchlib/music/Timeline.js";
import { Rational } from "../../sketchlib/Rational.js";
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
  make_param(-HALF_DIST, 0, HALF_DURATION, Ease.out_cubic),
  // Leave to the right, speeding up from rest
  make_param(0, HALF_DIST, HALF_DURATION, Ease.in_cubic),
);
const CURVE_POSITION = LoopCurve.from_timeline(TIMELINE_POSITION);

const PLATFORM_WIDTH = 25;
const PLATFORM_HEIGHT = 25;
const TOP_HEIGHT = 15;
const PLATFORM_TOP = new RectPrimitive(
  Point.ORIGIN,
  new Direction(PLATFORM_WIDTH, TOP_HEIGHT),
);
const PLATFORM_SHADOW = new RectPrimitive(
  new Point(0, TOP_HEIGHT),
  new Direction(PLATFORM_WIDTH, PLATFORM_HEIGHT - TOP_HEIGHT),
);
const STYLE_TOP = new Style({
  fill: PALETTE_CORAL[Values.MED_LIGHT],
});
const STYLE_SHADOW = new Style({
  fill: PALETTE_CORAL[Values.DARK],
});

// This should always be odd so one platform always sits at the center
const NUM_PLATFORMS = 11;
const PHASES = new Array(NUM_PLATFORMS).fill(0).map((_, i) => {
  const t_step = TIMELINE_POSITION.duration.real / (NUM_PLATFORMS - 1);
  return i * t_step;
});

/**
 * @implements {Animated}
 */
class TrafficLane {
  /**
   * Constructor
   * @param {Direction} center_offset
   */
  constructor(center_offset) {
    this.center_offset = center_offset;

    this.transforms = PHASES.map((phase) => {
      const dx = CURVE_POSITION.value(phase);
      return new Transform(center_offset.add(Direction.DIR_X.scale(dx)));
    });

    this.primitive = group(...this.style_primitives());
  }

  *style_primitives() {
    // We have n blocks and 2 styles to apply. Somewhat surprisingly,
    // styling each layer individually requires the least amount of
    // saving/restoring the graphics state. See
    // https://github.com/ptrgags/p5-sketchbook/issues/149#issuecomment-3738218567

    for (const transform of this.transforms) {
      const background = new GroupPrimitive(PLATFORM_TOP, {
        style: STYLE_TOP,
        transform,
      });

      const foreground = new GroupPrimitive(PLATFORM_SHADOW, {
        style: STYLE_SHADOW,
        transform,
      });
      yield background;
      yield foreground;
    }
  }

  /**
   *
   * @param {number} time
   */
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
