import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Primitive } from "./Primitive.js";
import { ToSVG } from "../svg/ToSVG.js";
import { svg_tag } from "../svg/svg_tag.js";

/**
 * Ellipse
 * @implements {Primitive}
 * @implements {ToSVG}
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

  to_svg() {
    const { x, y } = this.center;
    const { x: rx, y: ry } = this.radii;

    return svg_tag("ellipse", {
      cx: x.toString(),
      cy: y.toString(),
      rx: rx.toString(),
      ry: ry.toString(),
    });
  }
}
