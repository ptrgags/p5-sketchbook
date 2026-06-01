import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Primitive } from "./Primitive.js";

/**
 * @implements {Primitive}
 */
export class Ellipse {
  /**
   * Constructor
   * @param {Point} center
   * @param {Direction} radii
   */
  constructor(center, radii) {
    this.center = center;
    this.radii = radii;
  }

  /**
   * Draw an ellipse
   * @param {import("p5")} p
   */
  draw(p) {
    const { x, y } = this.center;
    const { x: rx, y: ry } = this.radii;
    p.ellipse(x, y, 2 * rx, 2 * ry);
  }
}
