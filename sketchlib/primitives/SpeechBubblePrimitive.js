import { is_nearly } from "../is_nearly.js";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Motor } from "../pga2d/versors.js";
import { Ellipse } from "./Ellipse.js";
import { PolygonPrimitive } from "./PolygonPrimitive.js";
import { Rect } from "./Rect.js";
import { group } from "./shorthand.js";

/**
 * When computing points for the tail triangle, we have pairs of intersections,
 * one with the horizontal center line, and one with the vertical center line.
 *
 * This selects the correct one
 * @param {Direction | Point} h_isx
 * @param {Direction | Point} v_isx
 * @param {Point} tip
 * @returns {Point} The point to use in the polygon
 */
function closer_to_tip(h_isx, v_isx, tip) {
  if (h_isx instanceof Point && v_isx instanceof Point) {
    const dist_h = h_isx.dist_sqr(tip);
    const dist_v = v_isx.dist_sqr(tip);

    return dist_h < dist_v ? h_isx : v_isx;
  } else if (h_isx instanceof Point) {
    return h_isx;
  } else if (v_isx instanceof Point) {
    return v_isx;
  }

  throw new Error("no valid intersection point");
}

export class SpeechBubblePrimitive {
  /**
   * Constructor
   * @param {Rect} content_bounds Bounds for the content inside the speech bubble
   * @param {Direction} margin How far the bubble extends past the content bounds in the x and y direction
   * @param {Point} tip Tip of the tail of the speech bubble
   * @param {number} tail_angle How wide the speech bubble opens in radians
   */
  constructor(content_bounds, margin, tip, tail_angle) {
    const center = content_bounds.center;
    const horizontal = center.join(Direction.DIR_X);
    const vertical = center.join(Direction.DIR_Y);
    const tail_line = center.join(tip);

    const rotate = Motor.rotation(tip, tail_angle);
    const rotate_inv = rotate.reverse();

    const tail_line_left = rotate.transform_line(tail_line);
    const tail_line_right = rotate_inv.transform_line(tail_line);

    const left_h = tail_line_left.meet(horizontal);
    const left_v = tail_line_left.meet(vertical);
    const point_left = closer_to_tip(left_h, left_v, tip);

    const right_h = tail_line_right.meet(horizontal);
    const right_v = tail_line_right.meet(vertical);
    const point_right = closer_to_tip(right_h, right_v, tip);

    const bubble = new Ellipse(
      center,
      content_bounds.dimensions.scale(0.5).add(margin),
    );

    const tail = new PolygonPrimitive([tip, point_right, point_left], true);

    this.primitive = group(bubble, tail);
  }

  draw(p) {
    this.primitive.draw(p);
  }
}
