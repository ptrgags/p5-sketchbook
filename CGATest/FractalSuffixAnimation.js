import { CAnimated } from "../sketchlib/cga2d/CAnimated.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { ConformalPrimitive } from "../sketchlib/cga2d/ConfomalPrimitive.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { StyledNode } from "../sketchlib/cga2d/StyledNode.js";
import { mod } from "../sketchlib/mod.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";
import { StyleRuns } from "../sketchlib/styling/StyleRuns.js";
import { whole_fract } from "../sketchlib/whole_fract.js";

/**
 *
 * @param {(function(number):CVersor)[]} xform_funcs
 * @param {number} max_iters
 * @returns {CVersor[][]}
 */
function bake_iterations(xform_funcs, max_iters) {
  const ifs = new IFS(xform_funcs.map((f) => f(1)));
  return range(max_iters + 1)
    .toArray()
    .map((depth) => ifs.iterate(depth));
}

/**
 * @implements {CAnimated}
 */
export class FractalSuffixAnimation {
  /**
   *
   * @param {(function(number):CVersor)[]} xform_funcs
   * @param {number} max_iters
   * @param {ConformalPrimitive} tile
   * @param {Style | Style[] | StyleRuns} styles
   */
  constructor(xform_funcs, max_iters, tile, styles) {
    this.xform_funcs = xform_funcs;
    this.max_iters = max_iters;

    this.iterations = bake_iterations(xform_funcs, max_iters);

    this.fan_out = new StyledNode(CVersor.IDENTITY, styles, tile);
    this.primitive = new CNode(CVersor.IDENTITY, this.fan_out);
  }

  update(time) {
    const iteration_index = Math.min(Math.floor(time), this.max_iters - 1);
    const t = mod(time, 1);
    this.primitive.update_transforms(...this.iterations[iteration_index]);

    const xforms = this.xform_funcs.map((f) => f(t));
    xforms.reverse();
    this.fan_out.update_transforms(...xforms);
  }
}
