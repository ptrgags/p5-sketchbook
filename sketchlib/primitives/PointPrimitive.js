import { Point } from "../../sketchlib/pga2d/Point.js";
import { Primitive } from "./Primitive.js";

const POINT_RADIUS = 4;

/**
 * A single point. This is rendered as a small circle of fixed size.
 * @implements {Primitive}
 */
export class PointPrimitive {
  /**
   * Constructor
   * @param {Point} position The position for this point
   */
  constructor(position) {
    this.position = position;
  }

  /**
   *
   * @param {import("p5")} p The p5.js library
   */
  draw(p) {
    const { x, y } = this.position;
    p.circle(x, y, 2 * POINT_RADIUS);
  }
}
