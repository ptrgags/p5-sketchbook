import { Animated } from "../sketchlib/animation/Animated.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { ConformalPrimitive } from "../sketchlib/cga2d/ConfomalPrimitive.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { group } from "../sketchlib/primitives/shorthand.js";

const SHRINK_FACTOR = 0.5;
const A_TRANSLATION = new Direction(-0.5, -0.5);
const B_TRANSLATION = new Direction(0.5, -0.5);
const C_TRANSLATION = new Direction(0, 0.5);

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

const SIERPINSKI_IFS = new IFS([
  sierpinski_a(1),
  sierpinski_b(1),
  sierpinski_c(1),
]);

const MAX_ITERS = 6;

/**
 * @implements {Animated}
 */
export class AnimatedSierpinski {
  /**
   * Constructor
   * @param {CVersor} to_screen
   */
  constructor(to_screen) {
    this.to_screen = to_screen;

    /**
     * @type {ConformalPrimitive[][]}
     */
    const ITER_PRIMS = new Array(MAX_ITERS + 1);
    ITER_PRIMS[0] = [Cline.UNIT_CIRCLE];
    for (let i = 1; i <= MAX_ITERS; i++) {
      ITER_PRIMS[i] = [...SIERPINSKI_IFS.iterate(i)].map((xform) => {
        return to_screen.compose(xform).transform(Cline.UNIT_CIRCLE);
      });
    }

    this.primitive = group(...ITER_PRIMS.flat());
  }

  update(time) {}
}
