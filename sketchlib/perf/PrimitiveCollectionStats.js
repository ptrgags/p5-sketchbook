import { ClipMask } from "../primitives/ClipMask.js";
import { Primitive } from "../primitives/Primitive.js";

/**
 * @interface RenderStats
 */
export class RenderStats {
  /**
   * The total
   * @type {string}
   */
  get type() {
    throw new Error("not implemented");
  }

  /**
   * The total number of p5.push()/p5.pop() pairs
   * used to render this primiive
   * @type {number}
   */
  get push_pop_count() {
    throw new Error("not implemented");
  }

  /**
   * @type {number}
   */
  set push_pop_count(value) {
    throw new Error("not implemented");
  }

  /**
   * Get the number of simple primitives in this
   * @type {number}
   */
  get simple_prim_count() {
    throw new Error("not implemented");
  }

  /**
   * @type {number}
   */
  set simple_prim_count(value) {
    throw new Error("not implemented");
  }

  /**
   * Child stats, or a class name (i.e. primitive.constructor.name) for simple primitives
   * @type {(string | RenderStats)[]}
   */
  get children() {
    throw new Error("not implemented");
  }
}

/**
 * Interface for a Primitive that contains
 * other stats
 * @interface PrimitiveCollectionStats
 */
export class PrimitiveCollectionStats {
  /**
   * @type {RenderStats}
   */
  get render_stats() {
    throw new Error("not implemented");
  }

  /**
   * Helper function to aggregate stats in place
   * @param {RenderStats} result output stats object to update
   * @param {...(Primitive | ClipMask)} children child primitives
   */
  static aggregate(result, ...children) {
    for (const child of children) {
      if (PrimitiveCollectionStats.has_stats(child)) {
        const child_stats = child.render_stats;
        result.push_pop_count += child_stats.push_pop_count;
        result.simple_prim_count += child_stats.simple_prim_count;
        result.children.push(child_stats);
      } else {
        // no additional push pops
        result.simple_prim_count += 1;
        result.children.push(child.constructor.name);
      }
    }
  }

  /**
   *
   * @param {RenderStats & {mask: RenderStats}} result
   * @param {ClipMask} mask
   */
  static aggregate_mask(result, mask) {
    const mask_stats = mask.render_stats;
    result.mask = mask_stats;
    result.push_pop_count += mask_stats.push_pop_count;
    result.simple_prim_count += mask_stats.simple_prim_count;
  }

  /**
   * Check if an object has render stats
   * @param {any} x
   * @returns {x is PrimitiveCollectionStats}
   */
  static has_stats(x) {
    return x.render_stats !== undefined;
  }
}
