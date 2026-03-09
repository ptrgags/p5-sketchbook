import { Direction } from "../../sketchlib/pga2d/Direction.js";
import { Point } from "../../sketchlib/pga2d/Point.js";
import { Ease } from "../../sketchlib/Ease.js";
import { RectPrimitive } from "../../sketchlib/primitives/RectPrimitive.js";
import { group } from "../../sketchlib/primitives/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { Animated } from "../../sketchlib/animation/Animated.js";
import { AnimationGroup } from "../../sketchlib/animation/AnimationGroup.js";
import { LoopCurve } from "../../sketchlib/animation/LoopCurve.js";
import { make_param } from "../../sketchlib/animation/ParamCurve.js";
import { Sequential } from "../../sketchlib/music/Timeline.js";
import { Rational } from "../../sketchlib/Rational.js";
import { PALETTE_CORAL, Values } from "../theme_colors.js";
import {
  LayerPrimitive,
  RenderLayers,
} from "../../sketchlib/primitives/LayerPrimitive.js";

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
const DIMS_PLATFORM_TOP = new Direction(PLATFORM_WIDTH, TOP_HEIGHT);
const DIMS_PLATFORM_SHADOW = new Direction(
  PLATFORM_WIDTH,
  PLATFORM_HEIGHT - TOP_HEIGHT,
);
const SHADOW_ORIGIN = new Point(0, TOP_HEIGHT);
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
 * @implements {RenderLayers}
 */
class TrafficLane {
  /**
   * Constructor
   * @param {Direction} center_offset
   */
  constructor(center_offset) {
    this.center_offset = center_offset;

    this.platform_tops = new Array(PHASES.length);
    this.platform_shadows = new Array(PHASES.length);

    PHASES.forEach((phase, i) => {
      const dx = CURVE_POSITION.value(phase);
      const offset = center_offset.add(Direction.DIR_X.scale(dx));
      this.platform_tops[i] = new RectPrimitive(
        Point.ORIGIN.add(offset),
        DIMS_PLATFORM_TOP,
      );
      this.platform_shadows[i] = new RectPrimitive(
        SHADOW_ORIGIN.add(offset),
        DIMS_PLATFORM_SHADOW,
      );
    });

    this.layers = [
      group(...this.platform_tops),
      group(...this.platform_shadows),
    ];

    this.primitive = group(...this.layers);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    PHASES.forEach((phase, i) => {
      const dx = CURVE_POSITION.value(time + phase);
      const offset = this.center_offset.add(Direction.DIR_X.scale(dx));
      this.platform_tops[i].position = Point.ORIGIN.add(offset);
      this.platform_shadows[i].position = SHADOW_ORIGIN.add(offset);
    });
  }
}

const LANES = [
  new Direction(250, 100),
  new Direction(200, 125),
  new Direction(150, 150),
  new Direction(100, 175),
].map((x) => new TrafficLane(x));

// Use this for update(t)
export const TRAFFIC = new AnimationGroup(...LANES);
// use this for rendering
export const TRAFFIC_LAYERS = new LayerPrimitive(LANES, [
  STYLE_TOP,
  STYLE_SHADOW,
]);
