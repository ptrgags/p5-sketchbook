/**
 * @typedef {import("./primitives").SimplePrimitive | GroupPrimitive} Primitive
 */

import { Style } from "../Style";
import { TextStyle } from "./TextStyle";
import { Transform } from "./Transform";

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
 */
export class GroupPrimitive {
  /**
   * Constructor
   * @param {Primitive | Primitive[]} primitives The primitive(s) to store in the group
   * @param {GroupSettings} [settings] Optional settings to apply to everything in the group.
   */
  constructor(primitives, settings) {
    if (!Array.isArray(primitives)) {
      throw new Error("primitives must be an array of Primitive");
    }
    this.primitives = primitives;
    this.style = settings.style;
    this.transform = settings.transform;
    this.text_style = settings.text_style;
  }

  *[Symbol.iterator]() {
    yield* this.primitives;
  }
}
