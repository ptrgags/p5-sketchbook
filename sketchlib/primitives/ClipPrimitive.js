import {
  PrimitiveCollectionStats,
  RenderStats,
} from "../perf/PrimitiveCollectionStats.js";
import { ClipMask } from "./ClipMask.js";
import { Primitive } from "./Primitive.js";

/**
 * Primitive clipped by a mask
 * @implements {Primitive}
 * @implements {PrimitiveCollectionStats}
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

  /**
   * Aggregate stats of the children
   * @type {RenderStats}
   */
  get render_stats() {
    const stats = {
      type: "clip",
      // a clip mask always pushes before drawing the clip mask
      push_pop_count: 1,
      simple_prim_count: 0,
      children: [],
      mask: undefined,
    };

    PrimitiveCollectionStats.aggregate_mask(stats, this.mask);
    PrimitiveCollectionStats.aggregate(stats, this.primitive);

    return stats;
  }
}
