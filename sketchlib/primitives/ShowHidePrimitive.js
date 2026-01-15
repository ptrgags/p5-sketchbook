import { Primitive } from "./Primitive.js";

/**
 * A collection of primitives where some can be shown/hidden
 * @implements {Primitive}
 */
export class ShowHidePrimitive {
  /**
   * Constructor
   * @param {Primitive[]} primitives
   * @param {boolean[]} show_flags
   */
  constructor(primitives, show_flags) {
    if (primitives.length !== show_flags.length) {
      throw new Error("show_flags must be the same length as primitives");
    }

    this.primitives = primitives;
    this.show_flags = show_flags;
  }

  /**
   * Draw primitives[i] whenever show_hide[i] is true
   * @param {import("p5")} p The p5.js instance
   */
  draw(p) {
    for (const [i, child] of this.primitives.entries()) {
      if (!this.show_flags[i]) {
        continue;
      }

      child.draw(p);
    }
  }
}
