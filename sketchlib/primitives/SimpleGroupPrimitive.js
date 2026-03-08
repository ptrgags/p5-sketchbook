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
   * @type {RenderStats}
   */
  get render_stats() {
    const children = [];
    let push_pop_count = 0;
    let simple_prim_count = 0;
    for (const child of this.children) {
      if (PrimitiveCollectionStats.has_stats(child)) {
        const child_stats = child.render_stats;
        push_pop_count += child_stats.push_pop_count;
        simple_prim_count += child_stats.simple_prim_count;
        children.push(child_stats);
      } else {
        children.push(child.constructor.name);
      }
    }

    return {
      type: "group",
      push_pop_count,
      simple_prim_count,
      children,
    };
  }
}
