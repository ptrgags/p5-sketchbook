import { Primitive } from "../../../sketchlib/primitives/Primitive.js";

/**
 * Interface for an object that manages an animated Primitive.
 * @interface Animated
 */
export class Animated {
  /**
   * Return a primitive that can be ued for rendering.
   * IMPORTANT: This primitive itself must remain alive for the
   * lifetime of the implementing class. This way, we can add this to
   * a GroupPrimitive once and not have to rebuild the whole scene graph every
   * frame.
   *
   * However, the implementing class is free to mutate this primitive's
   * fields in place. Obviously, use with care, prefer immutability where
   * possible.
   * @type {Primitive}
   */
  get primitive() {
    throw new Error("not implemented");
  }

  /**
   * Update the animation
   * @param {number} time Animation time (such as elapsed time in seconds or musical time)
   */
  update(time) {
    throw new Error("not implemented");
  }
}
