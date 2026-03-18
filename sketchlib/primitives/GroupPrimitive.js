import {
  PrimitiveCollectionStats,
  RenderStats,
} from "../perf/PrimitiveCollectionStats.js";
import { Style } from "../Style.js";
import { Primitive } from "./Primitive.js";
import { TextStyle } from "./TextStyle.js";
import { Transform } from "./Transform.js";

/**
 * @typedef {{
 *  style?: Style,
 *  text_style?: TextStyle,
 *  transform?: Transform
 * }} GroupSettings
 */

/**
 * A logical grouping of primitives to be rendered together, in the order
 * listed in the primitives array. This is the main way to apply styling and
 * transformations to primitives.
 *
 * Note: GroupPrimitive can be nested, but the most specific settings will
 * be applied.
 * @implements {Primitive}
 * @implements {PrimitiveCollectionStats}
 */
export class GroupPrimitive {
  /**
   * Constructor
   * @param {Primitive | Primitive[]} primitives The primitive(s) to store in the group
   * @param {GroupSettings} [settings] Optional settings to apply to everything in the group.
   */
  constructor(primitives, settings) {
    // For convenience, if there is a single primitive, wrap it in an array
    if (!Array.isArray(primitives)) {
      primitives = [primitives];
    }
    this.primitives = primitives;

    settings = settings ?? {};
    this.style = settings.style;
    this.transform = settings.transform;
    this.text_style = settings.text_style;
  }

  *[Symbol.iterator]() {
    yield* this.primitives;
  }

  /**
   * Replace all the primitives with a new set. This is helpful for animations
   * where the animation changes each frame, but we need a constant primitive
   * to contain them.
   * @param  {...Primitive} primitives New primitives
   */
  regroup(...primitives) {
    this.primitives.splice(0, Infinity, ...primitives);
  }

  /**
   * Draw a group primitive. This will always push a new drawing state, apply
   * any settings, and pop at the end.
   * @param {import("p5")} p p5.js library
   */
  draw(p) {
    if (this.primitives.length === 0) {
      return;
    }

    if (this.transform) {
      p.push();
    }

    if (this.style) {
      this.style.apply(p);
    }

    if (this.text_style) {
      this.text_style.apply(p);
    }

    if (this.transform) {
      this.transform.apply(p);
    }

    this.primitives.forEach((x) => x.draw(p));

    if (this.transform) {
      p.pop();
    }
  }

  /**
   * @type {RenderStats}
   */
  get render_stats() {
    const stats = {
      type: "group",
      has_style: this.style !== undefined,
      has_text_style: this.text_style !== undefined,
      has_transform: this.transform !== undefined,
      push_pop_count: this.transform ? 1 : 0,
      simple_prim_count: 0,
      children: [],
    };

    PrimitiveCollectionStats.aggregate(stats, ...this.primitives);

    return stats;
  }
}
