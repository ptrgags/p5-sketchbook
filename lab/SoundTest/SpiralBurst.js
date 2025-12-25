import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { HEIGHT, WIDTH } from "../../sketchlib/dimensions.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { PointPrimitive } from "../../sketchlib/primitives/PointPrimitive.js";
import { group, style } from "../../sketchlib/primitives/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { AnimationCurves } from "../lablib/animation/AnimationCurves.js";
import { N1, N4 } from "../lablib/music/durations.js";
import { ParamCurve } from "../lablib/music/ParamCurve.js";
import { Sequential } from "../lablib/music/Timeline.js";
import { Oklch } from "../lablib/Oklch.js";
import { Rational } from "../lablib/Rational.js";

const N = 10;
const CENTER = new Point(WIDTH / 2, (3 * HEIGHT) / 4);
const MAX_RADIUS = 50;

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
   * @param {AnimationCurves} curves the sound/animation system
   * @return {GroupPrimitive} the primitives to render
   */
  render(curves) {
    const radius_scale = curves.get_curve_val("radius") ?? 0.0;
    const phase_shift = curves.get_curve_val("phase") ?? 0;
    const lightness = curves.get_curve_val("lightness") ?? 0.7;
    const chroma = curves.get_curve_val("chroma") ?? 0.1;
    const hue = curves.get_curve_val("hue") ?? 130;

    const color = new Oklch(lightness, chroma, hue);
    const point_style = new Style({
      fill: color.to_srgb(),
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

  /**
   * Generate the parameters for a spiral burst, to be used with a score.
   * The animation will loop every measure of 4/4 time.
   * @param {Rational} duration Total duration of the animation
   * @return {AnimationCurves} Parameter entries to include in a score
   */
  static make_curves(duration) {
    const spiral_duration = new Rational(15, 16);
    const burst_duration = Rational.ONE.sub(spiral_duration);

    const radius = Sequential.from_loop(
      new Sequential(
        new ParamCurve(0, 1, burst_duration),
        new ParamCurve(1, 0, spiral_duration)
      ),
      duration
    );
    const phase = Sequential.from_loop(
      new Sequential(
        new ParamCurve(0, 0, burst_duration),
        new ParamCurve(0, 1, spiral_duration)
      ),
      duration
    );

    // Color parameters in Oklch color space

    // At the start of the burst, the lightness and chroma jump up,
    // then ramp down over the course of a measure
    const lightness = Sequential.from_loop(
      new ParamCurve(0.7, 0.1, N1),
      duration
    );
    const chroma = Sequential.from_loop(
      new ParamCurve(0.3, 0.05, N1),
      duration
    );

    // The hue changes every quarter note
    const start_hue = 80;
    const hue_step = 60;
    const hue = Sequential.from_loop(
      new Sequential(
        new ParamCurve(start_hue + 0 * hue_step, start_hue + 0 * hue_step, N4),
        new ParamCurve(start_hue + 1 * hue_step, start_hue + 1 * hue_step, N4),
        new ParamCurve(start_hue + 2 * hue_step, start_hue + 2 * hue_step, N4),
        new ParamCurve(start_hue + 3 * hue_step, start_hue + 3 * hue_step, N4)
      ),
      duration
    );

    return new AnimationCurves({
      radius,
      phase,
      lightness,
      hue,
      chroma,
    });
  }
}
