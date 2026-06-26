import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { svg_tag } from "../svg/svg_tag.js";

export class BivectorPrimitive {
  /**
   * Constructor
   * @param {Point} origin Where the start of the parallelogram will go
   * @param {Direction} a First vector to place at the origin
   * @param {Direction} b Second vector to place at the origin
   */
  constructor(origin, a, b) {
    this.origin = origin;
    this.a = a;
    this.b = b;
  }

  /**
   *
   * @param {import("p5")} p
   */
  draw(p) {
    const { x, y } = this.origin;
    const { x: ax, y: ay } = this.a;
    const { x: bx, y: by } = this.b;

    p.beginShape();
    p.vertex(x, y);
    p.vertex(x + ax, y + ay);
    p.vertex(x + ax + bx, y + ay + by);
    p.vertex(x + bx, y + by);
    p.endShape(p.CLOSE);
  }

  to_svg() {
    const { x, y } = this.origin;
    const { x: ax, y: ay } = this.a;
    const { x: bx, y: by } = this.b;
    const vertices = [
      `${x},${y}`,
      `${x + ax},${y + ay}`,
      `${x + ax + bx},${y + ay + by}`,
      `${x + bx},${y + by}`,
    ];
    return svg_tag("polygon", { points: vertices.join(" ") });
  }
}
