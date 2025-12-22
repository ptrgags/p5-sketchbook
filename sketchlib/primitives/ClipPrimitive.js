import { ClipMask } from "./ClipMask.js";
import { Primitive } from "./Primitive.js";

/**
 * Primitive clipped by a mask
 * @implements {Primitive}
 */
export class ClipPrimitive {
  /**
   * Constructor
   * @param {ClipMask} mask The mask that will clip the shape of primitive
   * @param {Primitive} primitive The primitive to draw
   */
  constructor(mask, primitive) {
    this.mask = mask;
    this.primitive = primitive;
  }
  /**
   * Set the clip mask, then draw the primitive. This clips the primitive
   * to the pixels rendered by the mask.
   * @param {import("p5")} p p5.js instance
   */
  draw(p) {
    p.push();
    this.mask.clip(p);
    this.primitive.draw(p);
    p.pop();
  }
}
