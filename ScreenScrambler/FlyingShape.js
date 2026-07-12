import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { mod } from "../sketchlib/mod.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { xform } from "../sketchlib/primitives/shorthand.js";
import { Transform } from "../sketchlib/primitives/Transform.js";

/**
 * A shape that moves with a constant velocity
 * @implements {Primitive}
 */
export class FlyingShape {
  /**
   * Constructor
   * @param {Primitive} shape The primitive to draw
   * @param {Direction} initial_displacement Initial displacement from the origin
   * @param {Direction} initial_velocity The initial velocity of the shape
   */
  constructor(shape, initial_displacement, initial_velocity) {
    this.velocity = initial_velocity;
    this.transform = new Transform(initial_displacement);
    this.primitive = xform(shape, this.transform);
    this.prev_time = 0;
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    const dt = time - this.prev_time;
    this.prev_time = time;

    const pos = this.transform.translation;
    const moved = pos.add(this.velocity.scale(dt));

    this.transform.translation = new Direction(
      mod(moved.x, WIDTH),
      mod(moved.y, HEIGHT),
    );
  }

  /**
   *
   * @param {import("p5")} p
   */
  draw(p) {
    this.primitive.draw(p);
  }
}
