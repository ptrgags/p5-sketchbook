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
   * Get the number of simple primitives in this
   * @type {number}
   */
  get simple_prim_count() {
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
   * Check if an object has render stats
   * @param {any} x
   * @returns {x is PrimitiveCollectionStats}
   */
  static has_stats(x) {
    return x.render_stats !== undefined;
  }
}
