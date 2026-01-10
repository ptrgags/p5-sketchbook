import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { group } from "../../../sketchlib/primitives/shorthand.js";
import { Animated } from "./Animated.js";

/**
 * Simple collection of Animated primitives. It wraps them in a GroupPrimitive
 * (only if needed) and handles updating them in bulk.
 * @implements {Animated}
 */
export class AnimationGroup {
  /**
   * Constructor
   * @param  {...Animated} children Animated objects to add to the group
   */
  constructor(...children) {
    this.children = children;

    if (children.length === 0) {
      this.primitive = GroupPrimitive.EMPTY;
    } else if (children.length === 1) {
      this.primtiive = children[0].primitive;
    } else {
      this.primitive = group(...children.map((x) => x.primitive));
    }
  }

  /**
   *
   * @param {number} time Animation time
   */
  update(time) {
    this.children.map((x) => x.update(time));
  }
}
