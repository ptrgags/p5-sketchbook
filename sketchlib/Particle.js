import { Point } from "../pga2d/objects.js";

export class Particle {
  /**
   * Constructor
   * @param {Point} position initial position as a Point.direction
   * @param {Point} velocity initial velocity as a point
   */
  constructor(position, velocity) {
    this.position = position;
    this.velocity = velocity;
  }

  /**
   * Update the particle by applying an acceleration
   * @param {number} dt The time delta
   * @param {Point} acceleration The acceleration as a Point.direction
   */
  update(dt, acceleration) {
    this.velocity = this.velocity.add(acceleration.scale(dt));
    this.position = this.position.add(this.velocity.scale(dt));
  }
}
