import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import {
  Hold,
  make_param,
  ParamCurve,
} from "../sketchlib/animation/ParamCurve.js";
import { N1, N4 } from "../sketchlib/music/durations.js";
import { Sequential, TimeInterval } from "../sketchlib/music/Timeline.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Rational } from "../sketchlib/Rational.js";
import { Ease } from "../sketchlib/Ease.js";
import { Animated } from "../sketchlib/animation/Animated.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";

const N = 10;
const CENTER = new Point(WIDTH / 2, (3 * HEIGHT) / 4);
const MAX_RADIUS = 50;

const DURATION_SPIRAL = new Rational(15, 16);
const DURATION_BURST = new Rational(3, 64);
const DURATION_BOUNCE = new Rational(1, 64);

const CURVE_RADIUS = LoopCurve.from_timeline(
  new Sequential(
    make_param(1.0, 0.9, DURATION_BOUNCE, Ease.in_cubic),
    make_param(0.9, 0.1, DURATION_SPIRAL, Ease.in_out_cubic),
    // In the last 16th note, burst outwards suddenly, bouncing back
    make_param(0.1, 1.0, DURATION_BURST, Ease.out_cubic),
  ),
);

const CURVE_PHASE = LoopCurve.from_timeline(
  new Sequential(
    make_param(0, 1, DURATION_SPIRAL),
    // Hold the angle steady while bursting
    new Hold(DURATION_BURST.add(DURATION_BOUNCE)),
  ),
);

// Color parameters in Oklch color space

// At the start of the burst, the lightness and chroma jump up,
// then ramp down over the course of a measure
const CURVE_LIGHTNESS = LoopCurve.from_timeline(
  make_param(0.7, 0.7 /*0.1*/, N1),
);
const CURVE_CHROMA = LoopCurve.from_timeline(make_param(0.3, 0.05, N1));

// The hue changes every quarter note as a step function
const start_hue = 80;
const hue_step = 60;
const CURVE_HUE = LoopCurve.from_timeline(
  new Sequential(
    new TimeInterval(ParamCurve.const_val(start_hue + 0 * hue_step), N4),
    new TimeInterval(ParamCurve.const_val(start_hue + 1 * hue_step), N4),
    new TimeInterval(ParamCurve.const_val(start_hue + 2 * hue_step), N4),
    new TimeInterval(ParamCurve.const_val(start_hue + 3 * hue_step), N4),
  ),
);

/**
 * Several points arranged in a circle that spiral inwards, then burst
 * outwards on the beat. Essentially a visual metronome.
 * @implements {Animated}
 */
export class SpiralBurst {
  constructor() {
    this.phases = new Array(N);
    this.radii = new Array(N);
    for (let i = 0; i < N; i++) {
      this.phases[i] = (2 * Math.PI * i) / N;
      this.radii[i] = MAX_RADIUS;
    }

    /**
     * The points that spiral in and out of the center.
     * These are computed in update()
     * @type {Primitive[]}
     */
    this.points = new Array(N).fill(GroupPrimitive.EMPTY);
    this.primitive = new GroupPrimitive(this.points);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    const radius_scale = CURVE_RADIUS.value(time);
    const phase_shift = CURVE_PHASE.value(time);
    const lightness = CURVE_LIGHTNESS.value(time);
    const chroma = CURVE_CHROMA.value(time);
    const hue = CURVE_HUE.value(time);

    const color = new Oklch(lightness, chroma, hue);
    const point_style = new Style({
      fill: color,
    });

    for (let i = 0; i < N; i++) {
      const angle = this.phases[i] + phase_shift * Math.PI;
      const radius = this.radii[i] * radius_scale;
      const offset = Direction.from_angle(angle).scale(radius);
      const point = CENTER.add(offset);
      this.points[i] = style(point, point_style);
    }
  }
}
