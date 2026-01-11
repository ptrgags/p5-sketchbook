import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { HEIGHT, WIDTH } from "../../sketchlib/dimensions.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { PointPrimitive } from "../../sketchlib/primitives/PointPrimitive.js";
import { group, style } from "../../sketchlib/primitives/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { LoopCurve } from "../lablib/animation/LoopCurve.js";
import { Hold, ParamCurve } from "../lablib/animation/ParamCurve.js";
import { N1, N4 } from "../lablib/music/durations.js";
import { Sequential } from "../lablib/music/Timeline.js";
import { Oklch } from "../lablib/Oklch.js";
import { Rational } from "../lablib/Rational.js";

const N = 10;
const CENTER = new Point(WIDTH / 2, (3 * HEIGHT) / 4);
const MAX_RADIUS = 50;

const DURATION_SPIRAL = new Rational(15, 16);
const DURATION_BURST = Rational.ONE.sub(DURATION_SPIRAL);

const CURVE_RADIUS = LoopCurve.from_timeline(
  new Sequential(
    new ParamCurve(0, 1, DURATION_BURST),
    new ParamCurve(1, 0, DURATION_SPIRAL)
  )
);
const CURVE_PHASE = LoopCurve.from_timeline(
  new Sequential(
    // Hold the angle steady while bursting
    new Hold(DURATION_BURST),
    new ParamCurve(0, 1, DURATION_SPIRAL)
  )
);

// Color parameters in Oklch color space

// At the start of the burst, the lightness and chroma jump up,
// then ramp down over the course of a measure
const CURVE_LIGHTNESS = LoopCurve.from_timeline(new ParamCurve(0.7, 0.1, N1));
const CURVE_CHROMA = LoopCurve.from_timeline(new ParamCurve(0.3, 0.05, N1));

// The hue changes every quarter note as a step function
const start_hue = 80;
const hue_step = 60;
const CURVE_HUE = LoopCurve.from_timeline(
  new Sequential(
    ParamCurve.const_val(start_hue + 0 * hue_step, N4),
    ParamCurve.const_val(start_hue + 1 * hue_step, N4),
    ParamCurve.const_val(start_hue + 2 * hue_step, N4),
    ParamCurve.const_val(start_hue + 3 * hue_step, N4)
  )
);

export class SpiralBurst {
  constructor() {
    this.phases = new Array(N);
    this.radii = new Array(N);
    for (let i = 0; i < N; i++) {
      this.phases[i] = (2 * Math.PI * i) / N;
      this.radii[i] = MAX_RADIUS;
    }
  }

  /**
   * Render the circles that make up the burst
   * @param {number} time current animation time
   * @return {GroupPrimitive} the primitives to render
   */
  render(time) {
    const radius_scale = CURVE_RADIUS.value(time);
    const phase_shift = CURVE_PHASE.value(time);
    const lightness = CURVE_LIGHTNESS.value(time);
    const chroma = CURVE_CHROMA.value(time);
    const hue = CURVE_HUE.value(time);

    const color = new Oklch(lightness, chroma, hue);
    const point_style = new Style({
      fill: color,
    });

    /**
     * @type {GroupPrimitive[]}
     */
    const points = new Array(N);
    for (let i = 0; i < N; i++) {
      const angle = this.phases[i] + phase_shift * Math.PI;
      const radius = this.radii[i] * radius_scale;
      const offset = Direction.from_angle(angle).scale(radius);
      const point = new PointPrimitive(CENTER.add(offset));
      points[i] = style(point, point_style);
    }

    return group(...points);
  }
}
