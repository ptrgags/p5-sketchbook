import { CEven } from "./CEven.js";
import { COdd } from "./COdd.js";
import { ConformalPrimitive } from "./ConfomalPrimitive.js";
import { CVersor } from "./CVersor.js";

/**
 * @implements {ConformalPrimitive}
 */
export class CNode {
  /**
   * @type {ConformalPrimitive}
   */
  #primitive;
  /**
   * @type {ConformalPrimitive[]}
   */
  #transformed_prims;

  /**
   * Constructor
   * @param {CVersor | CVersor[]} xforms One or more transformations
   * @param {ConformalPrimitive} [primitive] The primitive to transform. It can be set later
   */
  constructor(xforms, primitive) {
    if (!Array.isArray(xforms)) {
      this.xforms = [xforms];
    } else {
      this.xforms = xforms;
    }

    this.primitive = primitive;
  }

  /**
   * @type {ConformalPrimitive}
   */
  get primitive() {
    return this.#primitive ?? ConformalPrimitive.EMPTY;
  }

  /**
   * @type {ConformalPrimitive}
   */
  set primitive(value) {
    this.#primitive = value;
    this.#transformed_prims = undefined;
  }

  /**
   * @type {ConformalPrimitive[]}
   */
  get transformed_prims() {
    if (!this.#transformed_prims) {
      this.#transformed_prims = this.xforms.map((x) =>
        x.transform(this.primitive),
      );
    }

    return this.#transformed_prims;
  }

  /**
   * Transform the primitive
   * @param {COdd | CEven} versor
   * @returns {CNode}
   */
  transform(versor) {
    const xforms = this.xforms.map((x) => {
      return new CVersor(versor.gp(x.versor));
    });
    return new CNode(xforms, this.primitive);
  }

  /**
   *
   * @param {import("p5")} p
   */
  draw(p) {
    this.transformed_prims.forEach((x) => x.draw(p));
  }
}
