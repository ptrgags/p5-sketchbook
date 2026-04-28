import { GroupPrimitive } from "../primitives/GroupPrimitive.js";
import { Primitive } from "../primitives/Primitive.js";
import { group } from "../primitives/shorthand.js";
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

    this.primitive = Primitive.EMPTY;
    if (children.length === 0) {
      this.primitive = Primitive.EMPTY;
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
