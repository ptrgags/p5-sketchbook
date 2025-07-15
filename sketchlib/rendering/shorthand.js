import { Style } from "../Style.js";
import { GroupPrimitive } from "./GroupPrimitive.js";
import { Transform } from "./Transform.js";

/**
 * @typedef {import("./primitives").SimplePrimitive | GroupPrimitive} Primitive
 */

/**
 * Shorthand for creating a GroupPrimitive that just groups primitives with
 * no styling/transformations
 * @param  {...Primitive} primitives
 * @returns
 */
export function group(...primitives) {
  return new GroupPrimitive(primitives);
}

/**
 * Apply a style to one or more primitives, creating a group
 * @param {Primitive | Primitive[]} primitives The primitives
 * @param {Style} style The style to apply to all the primitives
 * @returns {GroupPrimitive} The grouped and styled primitives
 */
export function style(primitives, style) {
  return new GroupPrimitive(primitives, {
    style,
  });
}

/**
 * Apply a transformation to one or more primitives, creating a group
 * @param {Primitive | Primitive[]} primitives The primitive(s) to group
 * @param {Transform} transform The transform to apply
 * @returns {GroupPrimitive} The transformed group of primitives
 */
export function xform(primitives, transform) {
  return new GroupPrimitive(primitives, {
    transform,
  });
}
