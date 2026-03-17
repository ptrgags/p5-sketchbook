import { CEven } from "./CEven.js";
import { COdd } from "./COdd.js";
import { ConformalPrimitive } from "./ConfomalPrimitive.js";
import { CTile } from "./CTile.js";
import { CVersor } from "./CVersor.js";

/**
 * Class for mapping a collection of conformal transformations (e.g. output from an IFS)
 * over a single primitive. This is intended for cases where the transformation
 * hierarchy changes each frame (which is often the case when animating)
 *
 * It's kinda like instancing... except we don't have GPU instancing available
 * when rendering to the p5 canvas, so it's a loop over the transformations.
 *
 * If the whole transformation hierarchy is static over time, just transform
 * the primitives instead of using this class.
 * @implements {ConformalPrimitive}
 */
export class CNode {
  /**
   * Constructor
   * @param {CVersor | CVersor[]} transforms Transformations to apply
   * @param {ConformalPrimitive} primitive Primitive that will be transformed.
   */
  constructor(transforms, primitive) {
    this.transforms = transforms instanceof CVersor ? [transforms] : transforms;
    this.primitive = primitive;
  }

  /**
   * Swap out the transformations
   * @param  {...CVersor} transforms
   */
  update_transforms(...transforms) {
    this.transforms.splice(0, Infinity, ...transforms);
  }

  /**
   *
   * @param {COdd | CEven} versor
   * @returns {CNode}
   */
  transform(versor) {
    const transforms = this.transforms.map((x) => {
      const v = versor.gp(x.versor);
      return new CVersor(v);
    });
    return new CNode(transforms, this.primitive);
  }

  /**
   * Apply the transformations to the children, returning a flat array
   * @returns {ConformalPrimitive[]}
   */
  bake() {
    return this.transforms.map((x) => x.transform(this.primitive));
  }

  /**
   * For convenience, take the output of bake() and turn it into a CTile
   * @returns {CTile}
   */
  bake_tile() {
    return new CTile(...this.bake());
  }

  /**
   * Transform the primitive once for each primitive
   * @param {import("p5")} p
   */
  draw(p) {
    this.bake().map((x) => x.draw(p));
  }
}
