import { Primitive } from "./Primitive.js";

/**
 * Render an array of primtives progressively, as if slicing an array
 * (without actually copying the array)
 * @implements {Primitive}
 */
export class ProgressivePrimitive {
  /**
   * Constructor
   * @param {Primitive[]} primitives
   * @param {number} rate How fast to progress through the array in primitives/(unit time)
   */
  constructor(primitives, rate) {
    this.primitives = primitives;
    this.rate = rate;
    this.max_index = 0;
  }

  /**
   * Update
   * @param {number} time
   */
  update(time) {
    this.max_index = Math.round(time * this.rate);
  }

  /**
   * Draw primitives from the start of the array up to the maximum index
   * (or the end of the array)
   * @param {import("p5")} p
   */
  draw(p) {
    const max_index = Math.min(this.max_index, this.primitives.length);
    for (let i = 0; i < max_index; i++) {
      this.primitives[i].draw(p);
    }
  }
}
