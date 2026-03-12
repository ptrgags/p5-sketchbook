import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import {
  Hold,
  make_param,
  ParamCurve,
} from "../sketchlib/animation/ParamCurve.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { ConformalPrimitive } from "../sketchlib/cga2d/ConfomalPrimitive.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Rational } from "../sketchlib/Rational.js";
import { Style } from "../sketchlib/Style.js";
import { whole_fract } from "../sketchlib/whole_fract.js";

const SHRINK_FACTOR = 0.5;
const A_TRANSLATION = new Direction(-0.5, -0.5);
const B_TRANSLATION = new Direction(0.5, -0.5);
const C_TRANSLATION = new Direction(0, 0.5);

const STYLE_SIERPINSKI = new Style({
  fill: new Oklch(0.7676, 0.1381, 82.79),
  width: 2,
  stroke: new Oklch(0.66, 0.1381, 72.11),
});

/**
 *
 * @param {Direction} offset
 * @param {number} scale
 * @returns {function(number): CVersor}
 */
function interpolate_ts(offset, scale) {
  /**
   * @param {number} t
   * @returns {CVersor}
   */
  return function (t) {
    if (t === 0) {
      return CVersor.IDENTITY;
    }
    const interpolated_offset = offset.scale(t);
    const interpolated_factor = Math.pow(scale, t);
    return CVersor.translation(interpolated_offset).compose(
      CVersor.dilation(interpolated_factor),
    );
  };
}

const sierpinski_a = interpolate_ts(A_TRANSLATION, SHRINK_FACTOR);
const sierpinski_b = interpolate_ts(B_TRANSLATION, SHRINK_FACTOR);
const sierpinski_c = interpolate_ts(C_TRANSLATION, SHRINK_FACTOR);
const SIERPINSKI_FUNCTIONS = [sierpinski_a, sierpinski_b, sierpinski_c];

const SIERPINSKI_IFS = new IFS([
  sierpinski_a(1),
  sierpinski_b(1),
  sierpinski_c(1),
]);

export const MAX_ITERS = 5;

const CURVE_A = LoopCurve.from_timeline(
  new Sequential(
    make_param(0, 1, new Rational(1, 3)),
    new Hold(new Rational(2, 3)),
  ),
);
const CURVE_B = LoopCurve.from_timeline(
  new Sequential(
    new Hold(new Rational(1, 3)),
    make_param(0, 1, new Rational(1, 3)),
    new Hold(new Rational(1, 3)),
  ),
);
const CURVE_C = LoopCurve.from_timeline(
  new Sequential(
    new Hold(new Rational(2, 3)),
    make_param(0, 1, new Rational(1, 3)),
  ),
);
const CURVE_INFINITE_LOOP = LoopCurve.from_timeline(
  make_param(0, 3, new Rational(1)),
);

/**
 * @implements {Animated}
 */
export class AnimatedSierpinski {
  /**
   * Constructor
   * @param {CVersor} to_screen
   */
  constructor(to_screen) {
    /**
     * @type {ConformalPrimitive[]}
     */
    this.iter_prims = new Array(MAX_ITERS + 1);
    this.iter_prims[0] = Cline.UNIT_CIRCLE;
    for (let i = 1; i <= MAX_ITERS; i++) {
      this.iter_prims[i] = new CNode(
        SIERPINSKI_IFS.iterate(i),
        Cline.UNIT_CIRCLE,
      );
    }
    this.full_fractal = this.iter_prims.at(-1);

    // primitives to render get added here
    this.tile = new CTile();
    this.root = new CNode(to_screen, this.tile);
    this.primitive = style([this.root], STYLE_SIERPINSKI);
  }

  update(time) {
    const iter_index = Math.min(Math.floor(time), this.iter_prims.length - 1);
    const full_iteration = this.iter_prims[iter_index];

    if (time < MAX_ITERS) {
      const t_a = CURVE_A.value(time);
      const t_b = CURVE_B.value(time);
      const t_c = CURVE_C.value(time);

      const xform_a = sierpinski_a(t_a);
      const xform_b = sierpinski_b(t_b);
      const xform_c = sierpinski_c(t_c);

      const prims_a = xform_a.transform(full_iteration);
      const prims_b = xform_b.transform(full_iteration);
      const prims_c = xform_c.transform(full_iteration);

      this.tile.regroup(prims_c, prims_b, prims_a);
      // TODO: need a better way to detect if children change...
      // this feels similar to Redux state management
      this.root.primitive = this.tile;
    } else {
      // once we hit the limit of what we can render, we want to render
      // less. So we render only the full iteration and a scaled copy
      // based on the current transform

      const param = CURVE_INFINITE_LOOP.value(time);
      const [xform_index, xform_t] = whole_fract(param);

      const xform = SIERPINSKI_FUNCTIONS[xform_index](xform_t);
      const shrunken = xform.transform(full_iteration);
      this.tile.regroup(this.full_fractal, shrunken);
      this.root.primitive = this.tile;
    }
  }
}
