import { Direction } from "../../sketchlib/pga2d/Direction.js";
import { Point } from "../../sketchlib/pga2d/Point.js";
import { Color } from "../Color.js";
import { Style } from "../Style.js";
import { Circle } from "./Circle.js";
import { Primitive } from "./Primitive.js";
import { group, style } from "./shorthand.js";

const SCLERA_COLOR = 255;
const PUPIL_COLOR = 0;

const STYLE_SCLERA = new Style({
  fill: Color.WHITE,
  stroke: Color.BLACK,
});

const STYLE_PUPIL = Style.flat(Color.BLACK);

/**
 * Everything is better with googly eyes, so let's make it a full-fledged
 * primitive 👀
 *
 * Besides adding whimsy, it's also helpful for visualizing quantities
 * with a position and orientation
 *
 * @implements {Primitive}
 */
export class GooglyEye {
  /**
   * Constructor
   * @param {Point} position
   * @param {Direction} look_direction
   * @param {number} sclera_radius
   * @param {number} pupil_radius
   */
  constructor(position, look_direction, sclera_radius, pupil_radius) {
    this.position = position;
    this.look_direction = look_direction;
    this.sclera_radius = sclera_radius;
    this.pupil_radius = pupil_radius;

    /**
     * @type {Point}
     */
    this.pupil_center = this.position.add(
      this.look_direction.scale(this.sclera_radius - this.pupil_radius),
    );
  }

  /**
   * Update the position and look direction
   * @param {Point} position The new position of the eye
   * @param {Direction} look_direction The direction to look in. This must be normalized
   */
  update(position, look_direction) {
    this.position = position;
    this.look_direction = look_direction;
    this.pupil_center = this.position.add(
      this.look_direction.scale(this.sclera_radius - this.pupil_radius),
    );
  }

  /**
   * Draw the eye
   * @param {import("p5").default} p The p5.js library
   */
  draw(p) {
    STYLE_SCLERA.apply(p);
    p.circle(this.position.x, this.position.y, 2 * this.sclera_radius);

    // Draw the pupil
    STYLE_PUPIL.apply(p);
    p.circle(this.pupil_center.x, this.pupil_center.y, 2 * this.pupil_radius);
  }

  /**
   *
   * @param {import("pdf-lib")} pdf
   * @param {import("pdf-lib").PDFPage} page
   */
  draw_pdf(pdf, page) {
    // workaround for now until I get better circle rendering options.
    const sclera = new Circle(this.position, this.sclera_radius);
    const pupil = new Circle(this.pupil_center, this.pupil_radius);

    const styled = group(
      style(sclera, Style.flat(Color.WHITE)),
      style(pupil, Style.flat(Color.BLACK)),
    );
    styled.draw_pdf(pdf, page);
  }
}
