import { Point } from "../sketchlib/pga2d/Point.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Rectangle } from "../sketchlib/primitives/Rectangle.js";

const GROWTH_RATE = 0.1;

// Radius of points to check when computing repulsion
export const NEARBY_RADIUS = 20;

export class DifferentialNode {
  /**
   * Constructor
   * @param {Point} position
   */
  constructor(position) {
    this.position = position;
    this.velocity = Direction.ZERO;
    this.acceleration = Direction.ZERO;
    this.mass = 1.0;
    this.fixed = false;
    this.quadtree_node = undefined;
    this.is_dirty = false;
  }

  /**
   * Apply forces to the growth node
   * @param {Direction} net_force Net force
   * @param {number} delta_time Delta time for this frame
   */
  apply_forces(net_force, delta_time) {
    // From Newton's Law:
    // a = (sum F_i) / m
    this.acceleration = net_force.scale(1.0 / this.mass);

    // Velocity is the integral of acceleration
    // dv = da * dt
    this.velocity = this.velocity.add(this.acceleration.scale(delta_time));

    // Position is the integral of velocity
    // dx = dv * dt
    this.position = this.position.add(this.velocity.scale(delta_time));
  }

  /**
   * Clamp to a boundary rectangle
   * @param {Rectangle} rectangle
   */
  clamp_to(rectangle) {
    this.position = rectangle.clamp(this.position);
  }

  check_if_dirty() {
    if (!this.quadtree_node.bounds.contains(this.position)) {
      this.is_dirty = true;
    }
  }

  grow() {
    this.mass += GROWTH_RATE;
  }

  // for debugging
  draw(p) {
    const position = this.position;
    const velocity = this.velocity;
    const acceleration = this.acceleration;

    p.noFill();
    // draw the radius of determining nearby points
    p.strokeWeight(0.5);
    p.stroke(255);
    p.circle(position.x, position.y, 2 * NEARBY_RADIUS);

    // position vectors
    p.strokeWeight(3);
    p.stroke(255, 0, 0);
    p.line(
      position.x,
      position.y,
      position.x + velocity.x,
      position.y + velocity.y,
    );
    p.stroke(0, 255, 0);
    p.line(
      position.x,
      position.y,
      position.x + acceleration.x,
      position.y + acceleration.y,
    );

    p.stroke(255, 127, 0);
    p.point(position.x, position.y);
  }
}
