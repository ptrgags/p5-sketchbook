import { Point } from "../../pga2d/Point.js";
import { Primitive } from "./Primitive.js";

/**
 * Line segment
 * @implements {Primitive}
 */
export class LinePrimitive {
  /**
   * Constructor
   * @param {Point} a The start point
   * @param {Point} b The end point
   */
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  /**
   * Draw a line segment
   * @param {import("p5")} p The p5.js library
   */
  draw(p) {
    const a = this.a;
    const b = this.b;
    p.line(a.x, a.y, b.x, b.y);
  }
}
