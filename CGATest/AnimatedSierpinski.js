import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { ConformalPrimitive } from "../sketchlib/cga2d/ConfomalPrimitive.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Rational } from "../sketchlib/Rational.js";
import { Style } from "../sketchlib/Style.js";
import { FractalPrefixAnimation } from "./FractalPrefixAnimation.js";
import { FractalSuffixAnimation } from "./FractalSuffixAnimation.js";

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

export const MAX_ITERS = 5;
/**
 * Pre-compute the full iterations. The animation will transform the result.
 * @type {ConformalPrimitive[]}
 */
const ITER_PRIMS = new Array(MAX_ITERS + 1);
ITER_PRIMS[0] = Cline.UNIT_CIRCLE;
for (let i = 1; i <= MAX_ITERS; i++) {
  ITER_PRIMS[i] = new CNode(
    SIERPINSKI_IFS.iterate(i),
    Cline.UNIT_CIRCLE,
  ).bake_tile();
}

export const SIERPINSKI_TRIANGLE = new FractalPrefixAnimation(
  SIERPINSKI_FUNCTIONS,
  MAX_ITERS,
  Cline.UNIT_CIRCLE,
  STYLE_SIERPINSKI,
);

export const SIERPINSKI_SUFFIX = new FractalSuffixAnimation(
  SIERPINSKI_FUNCTIONS,
  MAX_ITERS,
  Cline.UNIT_CIRCLE,
  STYLE_SIERPINSKI,
);
