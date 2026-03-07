import { mod } from "../mod.js";
import { group } from "../primitives/shorthand.js";
import { Animated } from "./Animated.js";

/**
 * A container for Animated that only shows one at a time. It acts like a
 * cyclical array
 * @implements {Animated}
 */
export class SelectAnimated {
  /**
   * Constructor
   * @param {Animated[]} animations
   */
  constructor(animations) {
    this.animations = animations;
    this.index = 0;

    this.primitive = group();
    this.update_primitive();
  }

  /**
   * Get the currently selected animation, or undefined if the list was empty
   * @type {Animated | undefined}
   */
  get selected_animation() {
    if (this.animations.length === 0) {
      return undefined;
    }

    return this.animations[mod(this.index, this.animations.length)];
  }

  /**
   * Select a specific index (looping around)
   * @param {number} index
   */
  select(index) {
    this.index = index;
    this.update_primitive();
  }

  /**
   * Select the next animation (looping around)
   */
  next() {
    this.index++;
    this.update_primitive();
  }

  /**
   * Select the previous animation (looping around)
   */
  prev() {
    this.index--;
    this.update_primitive();
  }

  update_primitive() {
    const primitive = this.selected_animation?.primitive;
    if (primitive) {
      this.primitive.regroup(primitive);
    } else {
      this.primitive.regroup();
    }
  }

  /**
   * Update the currently selected primitive (if there is one)
   * @param {number} time
   */
  update(time) {
    this.selected_animation?.update(time);
  }
}
