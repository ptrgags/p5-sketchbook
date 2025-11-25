import { Point } from "../../pga2d/objects.js";
import { GroupPrimitive } from "../../sketchlib/rendering/GroupPrimitive.js";
import { PointPrimitive } from "../../sketchlib/rendering/primitives.js";
import { group } from "../../sketchlib/rendering/shorthand.js";
import { ParamCurve } from "../lablib/music/ParamCurve.js";
import { Sequential } from "../lablib/music/Timeline.js";
import { Rational } from "../lablib/Rational.js";
import { SoundManager } from "../lablib/SoundManager.js";

const N = 10;
const CENTER = Point.point(200, 200);
const MAX_RADIUS = 200;

export class SpiralBurst {
  constructor() {
    this.phases = new Array(N);
    this.radii = new Array(N);
    for (let i = 0; i < N; i++) {
      this.phases[i] = Math.random() * 2 * Math.PI;
      this.radii[i] = Math.random() * MAX_RADIUS;
    }
  }

  /**
   * Render the circles that make up the burst
   * @param {SoundManager} sound the sound/animation system
   * @return {GroupPrimitive} the primitives to render
   */
  render(sound) {
    const radius_scale = sound.get_param("radius");
    const phase_shift = sound.get_param("phase");

    /**
     * @type {PointPrimitive[]}
     */
    const points = new Array(N);
    for (let i = 0; i < N; i++) {
      const angle = this.phases[i] + phase_shift * Math.PI;
      const radius = this.radii[i] * radius_scale;
      const offset = Point.dir_from_angle(angle).scale(radius);
      points[i] = new PointPrimitive(CENTER.add(offset));
    }

    return group(...points);
  }

  /**
   * Generate the parameters for a spiral burst, to be used with a score.
   * The animation will loop every measure of 4/4 time.
   * @param {Rational} duration Total duration of the animation
   * @return {[string, import("../lablib/music/Timeline.js").Timeline<ParamCurve>][]} Parameter entries to include in a score
   */
  static spiral_burst_params(duration) {
    const spiral_duration = new Rational(7, 8);
    const burst_duration = Rational.ONE.sub(spiral_duration);

    const radius = Sequential.from_loop(
      new Sequential(
        new ParamCurve(1, 0, spiral_duration),
        new ParamCurve(0, 1, burst_duration)
      ),
      duration
    );
    const phase = Sequential.from_loop(
      new Sequential(
        new ParamCurve(0, 1, spiral_duration),
        new ParamCurve(0, 0, burst_duration)
      ),
      duration
    );
    return [
      ["radius", radius],
      ["phase", phase],
    ];
  }
}
