import { Primitive } from "../primitives/Primitive.js";
import { CEven } from "./CEven.js";
import { COdd } from "./COdd.js";

/**
 * Primitive type for conformal geometry. These are Primitives
 * (i.e. can be drawn) but also can be transformed by a versor.
 * @interface ConformalPrimitive
 */
export class ConformalPrimitive extends Primitive {
  /**
   * Transform this primitive to another one of
   * the same type.
   * @param {CEven | COdd} versor
   * @returns {ConformalPrimitive} The same type, but that's not exactly expressible in TypeScript
   */
  transform(versor) {
    throw new Error("not implemented");
  }
}
/**
 * @type {Readonly<ConformalPrimitive>}
 */
ConformalPrimitive.EMPTY = Object.freeze({
  transform() {
    return this;
  },
  draw(p) {},
});
