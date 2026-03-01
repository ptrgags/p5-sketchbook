import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Primitive } from "./Primitive.js";

/**
 * Infinite ray start--direction-->  inf
 *
 * @implements {Primitive}
 */
export class Ray {
  /**
   * Constructor
   * @param {Point} start Start point
   * @param {Direction} direction Direction of the ray. It will be normalized
   */
  constructor(start, direction) {
    this.start = start;
    this.direction = direction.normalize();
  }

  /**
   * Draw the ray
   * @param {import("p5")} p P5 library
   */
  draw(p) {
    const { x, y } = this.start;
    const { x: dx, y: dy } = this.direction;
    const YEET = 1000;
    p.line(x, y, x + YEET * dx, y + YEET * dy);
  }
}
