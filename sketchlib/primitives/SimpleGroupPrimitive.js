import {
  PrimitiveCollectionStats,
  RenderStats,
} from "../perf/PrimitiveCollectionStats.js";
import { Primitive } from "./Primitive.js";

/**
 * A collection of primitives that do not need any styling/transformations.
 * This is rendered as simply as possible
 * @implements {Primitive}
 * @implements {PrimitiveCollectionStats}
 */
export class SimpleGroupPrimitive {
  /**
   * Constructor
   * @param  {...Primitive} children Child primitives
   */
  constructor(...children) {
    this.children = children;
  }

  /**
   * Draw the primitives. This does not push/pop
   * @param {import("p5")} p
   */
  draw(p) {
    for (const child of this.children) {
      child.draw(p);
    }
  }

  /**
   * Replace all the primitives with a new set. This is helpful for animations
   * where the animation changes each frame, but we need a constant primitive
   * to contain them.
   * @param  {...Primitive} primitives New primitives
   */
  regroup(...primitives) {
    this.children.splice(0, Infinity, ...primitives);
  }

  /**
   * @type {RenderStats}
   */
  get render_stats() {
    const stats = {
      type: "group",
      push_pop_count: 0,
      simple_prim_count: 0,
      children: [],
    };
    PrimitiveCollectionStats.aggregate(stats, ...this.children);
    return stats;
  }
}
