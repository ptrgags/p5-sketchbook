import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { CAnimated } from "../sketchlib/cga2d/CAnimated.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { ConformalPrimitive } from "../sketchlib/cga2d/ConfomalPrimitive.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { StyledNode } from "../sketchlib/cga2d/StyledNode.js";
import { N1 } from "../sketchlib/music/durations.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { Rational } from "../sketchlib/Rational.js";
import { Style } from "../sketchlib/Style.js";
import { StyleRuns } from "../sketchlib/styling/StyleRuns.js";
import { whole_fract } from "../sketchlib/whole_fract.js";

/**
 * Make interpolation curves for the individual transformations
 * @param {number} n Number of curves to create
 * @returns {LoopCurve[]} Array of n animation curves
 */
function make_interpolation_curves(n) {
  if (n === 1) {
    return [LoopCurve.from_timeline(make_param(0, 1, N1))];
  }

  const timelines = new Array(n);

  timelines[0] = new Sequential(
    make_param(0, 1, new Rational(1, n)),
    new Hold(new Rational(n - 1, n)),
  );

  for (let i = 1; i < n - 1; i++) {
    timelines[i] = new Sequential(
      new Hold(new Rational(i, n)),
      make_param(0, 1, new Rational(1, n)),
      new Hold(new Rational(n - 1 - i, n)),
    );
  }

  timelines[timelines.length - 1] = new Sequential(
    new Hold(new Rational(n - 1, n)),
    make_param(0, 1, new Rational(1, n)),
  );

  return timelines.map(LoopCurve.from_timeline);
}

/**
 * Precompute a table of the full iterations
 * @param {(function(number):CVersor)[]} xform_funcs
 * @param {number} max_iters
 * @param {ConformalPrimitive} tile
 * @returns {ConformalPrimitive[]}
 */
function bake_iterations(xform_funcs, max_iters, tile) {
  const ifs = new IFS(xform_funcs.map((f) => f(1)));
  const primitives = new Array(max_iters + 1);
  primitives[0] = tile;
  for (let i = 1; i < max_iters; i++) {
    primitives[i] = new CNode(ifs.iterate(i), tile).bake_tile();
  }

  return primitives;
}

/**
 * @implements {CAnimated}
 */
export class FractalPrefixAnimation {
  /**
   * Constructor
   * @param {(function(number):CVersor)[]} xform_funcs
   * @param {number} max_iters
   * @param {ConformalPrimitive} tile The initial tile that will be transformed.
   * @param {Style | Style[] | StyleRuns} [styles]
   */
  constructor(xform_funcs, max_iters, tile, styles) {
    this.xform_funcs = xform_funcs;
    this.max_iters = max_iters;
    this.num_transforms = xform_funcs.length;

    this.iterations = bake_iterations(xform_funcs, max_iters, tile);

    this.interpolation_curves = make_interpolation_curves(this.num_transforms);
    this.curve_infinite_loop = LoopCurve.from_timeline(
      make_param(0, this.num_transforms, N1),
    );

    if (styles) {
      this.primitive = new StyledNode(
        CVersor.IDENTITY,
        styles,
        ConformalPrimitive.EMPTY,
      );
    } else {
      this.primitive = new CNode(CVersor.IDENTITY, ConformalPrimitive.EMPTY);
    }
  }

  update(time) {
    const iteration_index = Math.min(Math.floor(time), this.max_iters);
    this.primitive.primitive = this.iterations[iteration_index];

    if (time < this.max_iters) {
      const transformations = this.interpolation_curves.map((curve, i) => {
        const t = curve.value(time);
        const interpolated = this.xform_funcs[i](t);
        return interpolated;
      });

      this.primitive.update_transforms(...transformations);
    } else {
      const param = this.curve_infinite_loop.value(time);
      const [xform_index, xform_t] = whole_fract(param);
      const xform = this.xform_funcs[xform_index](xform_t);
      this.primitive.update_transforms(CVersor.IDENTITY, xform);
    }
  }
}
