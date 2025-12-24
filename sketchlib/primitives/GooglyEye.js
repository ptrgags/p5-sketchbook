import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { Primitive } from "./Primitive.js";

const SCLERA_COLOR = 255;
const PUPIL_COLOR = 0;

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
      this.look_direction.scale(this.sclera_radius - this.pupil_radius)
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
      this.look_direction.scale(this.sclera_radius - this.pupil_radius)
    );
  }

  /**
   * Draw the eye
   * @param {import("p5")} p The p5.js library
   */
  draw(p) {
    p.push();
    p.noStroke();
    // Draw the white of the eye
    p.fill(SCLERA_COLOR);
    p.stroke(0);
    p.circle(this.position.x, this.position.y, 2 * this.sclera_radius);

    // Draw the pupil
    p.fill(PUPIL_COLOR);
    p.circle(this.pupil_center.x, this.pupil_center.y, 2 * this.pupil_radius);
    p.pop();
  }
}
