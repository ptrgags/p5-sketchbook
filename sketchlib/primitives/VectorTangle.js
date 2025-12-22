import { ClipMask } from "./ClipMask.js";
import { GroupPrimitive } from "./GroupPrimitive.js";
import { Primitive } from "./Primitive.js";

/**
 * For making tangle patterns, the basic operation is to subdivide a shape into
 * several smaller regions. In each I can nest more patterns.
 * @implements {Primitive}
 */
export class VectorTangle {
  /**
   * Constructor
   * @param {[ClipMask, Primitive][]} subdivisions List of (mask, primitive) pairs that divide the
   * shape into multiple regions
   * @param {Primitive} [decoration=GroupPrimitive.EMPTY] Optional decoration to draw over top of the subdivisions.
   * This can be used for outlining the regions, or adding some artistic embelishments.
   */
  constructor(subdivisions, decoration = GroupPrimitive.EMPTY) {
    this.subdivisions = subdivisions;
    this.decoration = decoration;
  }

  /**
   * Draw the children clipped to their respective masks, then the decoration on top
   * @param {import("p5")} p
   */
  draw(p) {
    for (const [mask, child] of this.subdivisions) {
      p.push();
      mask.clip(p);
      child.draw(p);
      p.pop();
    }
    this.decoration.draw(p);
  }
}
