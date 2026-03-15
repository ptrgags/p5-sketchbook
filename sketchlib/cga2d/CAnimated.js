import { Animated } from "../animation/Animated.js";
import { ConformalPrimitive } from "./ConfomalPrimitive.js";

/**
 * Like Animated, but for ConformalPrimitive
 * @interface CAnimated
 * @extends {Animated}
 */
export class CAnimated extends Animated {
  /**
   * @type {ConformalPrimitive}
   */
  get primitive() {
    throw new Error("not implemented");
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    throw new Error("not implemented");
  }
}
