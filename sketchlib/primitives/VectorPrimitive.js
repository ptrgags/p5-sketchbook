import { Point } from "../../pga2d/Point.js";
import { Motor } from "../../pga2d/versors.js";

const ARROW_ANGLE = Math.PI / 6;

/**
 * Draw an arrow from tail to tip
 */
export class VectorPrimitive {
  /**
   * Constructor
   * @param {Point} tail The tail end of the arrow
   * @param {Point} tip The tip end of the arrow
   */
  constructor(tail, tip) {
    this.tail = tail;
    this.tip = tip;
  }

  /**
   * Draw a vector as an arrow. This only uses lines so styling only
   * comes from a stroke
   * @param {import("p5")} p p5.js library
   */
  draw(p) {
    const { tail, tip } = this;
    p.line(tail.x, tail.y, tip.x, tip.y);
    const rotate = Motor.rotation(tip, ARROW_ANGLE);
    const inv_rotate = rotate.reverse();

    const tip_back = Point.lerp(tail, tip, 0.8);
    const tip_left = rotate.transform_point(tip_back);
    const tip_right = inv_rotate.transform_point(tip_back);

    p.line(tip_left.x, tip_left.y, tip.x, tip.y);
    p.line(tip_right.x, tip_right.y, tip.x, tip.y);
  }
}
