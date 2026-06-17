import { Point } from "../pga2d/Point.js";
import { Primitive } from "../primitives/Primitive.js";

/**
 * A static image that's drawn on the screen as-is, unlike sprites and tilesets.
 *
 * Don't construct directly, use ImageLibrary.make_image()
 *
 * @see ImageLibrary
 * @implements {Primitive}
 */
export class Image {
  /**
   * Constructor
   * @param {import("p5").Image} p5_image
   * @param {Point} position
   */
  constructor(p5_image, position) {
    this.p5_image = p5_image;
    this.position = position;
  }

  /**
   * Draw the image on the screen
   * @param {import("p5")} p The p5.js library
   */
  draw(p) {
    p.image(this.p5_image, this.position.x, this.position.y);
  }
}
