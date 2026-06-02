import {
  PrimitiveCollectionStats,
  RenderStats,
} from "../perf/PrimitiveCollectionStats.js";
import { svg_tag } from "../svg/svg_tag.js";
import { ToSVG } from "../svg/ToSVG.js";
import { Primitive } from "./Primitive.js";

/**
 * A collection of primitives that do not need any styling/transformations.
 * This is rendered as simply as possible
 * @implements {Primitive}
 * @implements {PrimitiveCollectionStats}
 * @implements {ToSVG}
 */
export class SimpleGroupPrimitive {
  /**
   * Constructor
   * @param  {...Primitive} children Child primitives
   */
  constructor(...children) {
    this.children = children;
  }

  *[Symbol.iterator]() {
    yield* this.children;
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
   * Draw the primitives. This does not push/pop
   * @param {import("p5")} p
   */
  draw(p) {
    for (const child of this.children) {
      child.draw(p);
    }
  }

  /**
   *
   * @returns {SVGElement}
   */
  to_svg() {
    const g = svg_tag("g", {});
    for (const child of this.children) {
      if (!ToSVG.is_svg_compatible(child)) {
        console.warn("SVG export: skipping child", child);
        continue;
      }

      const child_svg = child.to_svg();
      g.appendChild(child_svg);
    }
    return g;
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
SimpleGroupPrimitive.EMPTY = Object.freeze(new SimpleGroupPrimitive());
