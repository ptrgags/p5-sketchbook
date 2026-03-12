import {
  PrimitiveCollectionStats,
  RenderStats,
} from "../perf/PrimitiveCollectionStats.js";
import { CEven } from "./CEven.js";
import { COdd } from "./COdd.js";
import { ConformalPrimitive } from "./ConfomalPrimitive.js";

/**
 * Collect a number of conformal primitives into a "Tile" that transforms
 * and renders together.
 * This is like a CGA analog of SimpleGroupPrimitive
 * @implements {ConformalPrimitive}
 * @implements {PrimitiveCollectionStats}
 */
export class CTile {
  /**
   * Constructor
   * @param {...ConformalPrimitive} children
   */
  constructor(...children) {
    this.children = children;
  }

  /**
   * Replace all the primitives in place
   * @param  {...ConformalPrimitive} children
   */
  regroup(...children) {
    this.children.splice(0, Infinity, ...children);
  }

  /**
   * Transform all the children by a transformation
   * @param {COdd | CEven} versor
   */
  transform(versor) {
    const children = this.children.map((x) => x.transform(versor));
    return new CTile(...children);
  }

  /**
   * Draw the children
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
    const stats = {
      type: "ctile",
      simple_prim_count: 0,
      push_pop_count: 0,
      children: [],
    };

    PrimitiveCollectionStats.aggregate(stats, ...this.children);
    return stats;
  }
}
