import {
  PrimitiveCollectionStats,
  RenderStats,
} from "../perf/PrimitiveCollectionStats.js";
import { ClipMask } from "./ClipMask.js";
import { GroupPrimitive } from "./GroupPrimitive.js";
import { Primitive } from "./Primitive.js";

/**
 * For making tangle patterns, the basic operation is to subdivide a shape into
 * several smaller regions. In each I can nest more patterns.
 * @implements {Primitive}
 * @implements {PrimitiveCollectionStats}
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

  /**
   * @type {RenderStats}
   */
  get render_stats() {
    const stats = {
      type: "vector-tangle",
      push_pop_count: 0,
      simple_prim_count: 0,
      children: [],
    };

    if (this.decoration) {
      PrimitiveCollectionStats.aggregate(stats, this.decoration);
    }

    for (const [mask, primitive] of this.subdivisions) {
      // Each panel is reported as a separate stat object
      // with a mask, similar to ClipPrimitive
      const panel_stats = {
        type: "tangle-panel",
        mask: undefined,
        // we push once per panel
        push_pop_count: 1,
        simple_prim_count: 0,
        children: [],
      };

      PrimitiveCollectionStats.aggregate_mask(panel_stats, mask);
      PrimitiveCollectionStats.aggregate(panel_stats, primitive);

      stats.children.push(panel_stats);
      stats.push_pop_count += panel_stats.push_pop_count;
      stats.simple_prim_count += panel_stats.simple_prim_count;
    }

    return stats;
  }
}
