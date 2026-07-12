import { Point } from "../pga2d/Point.js";
import { Primitive } from "../primitives/Primitive.js";

/**
 * Offscreen graphics object. This wraps p5.Graphics, but adapts it to the
 * primitive system
 */
export class Drawing {
  /**
   * Constructor
   * @param {import("p5").Graphics} p5_gfx
   * @param {Point} position
   */
  constructor(p5_gfx, position) {
    this.p5_gfx = p5_gfx;
    this.position = position;
  }

  clear() {
    this.p5_gfx.reset();
  }

  /**
   * Draw a primitive to the underlying canvas
   * @param {Primitive} primitive
   */
  draw_primitive(primitive) {
    primitive.draw(this.p5_gfx);
  }

  draw(p) {
    p.image(this.p5_gfx, this.position.x, this.position.y);
  }
}
