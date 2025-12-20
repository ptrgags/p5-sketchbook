import { Vector2 } from "./Vector2.js";
import { clamp } from "../sketchlib/clamp.js";

const GROWTH_RATE = 0.1;

// Radius of points to check when computing repulsion
export const NEARBY_RADIUS = 20;

const TEMP_DELTA_VELOCITY = new Vector2(0, 0);
const TEMP_DELTA_POSITION = new Vector2(0, 0);
export class DifferentialNode {
  /**
   *
   * @param {Vector2} position
   */
  constructor(position) {
    this.position = position;
    this.velocity = new Vector2(0, 0);
    this.acceleration = new Vector2(0, 0);
    this.mass = 1.0;
    this.fixed = false;
    this.quadtree_node = undefined;
    this.is_dirty = false;
  }

  apply_forces(net_force, delta_time) {
    // From Newton's Law:
    // a = (sum F_i) / m
    const acceleration = this.acceleration;
    acceleration.clone_from(net_force);
    acceleration.scale(1.0 / this.mass);

    // Velocity is the integral of acceleration
    // dv = da * dt
    const velocity = this.velocity;
    TEMP_DELTA_VELOCITY.clone_from(this.acceleration);
    TEMP_DELTA_VELOCITY.scale(delta_time);
    velocity.add(TEMP_DELTA_VELOCITY);

    // Position is the integral of velocity
    // dx = dv * dt
    TEMP_DELTA_POSITION.clone_from(velocity);
    TEMP_DELTA_POSITION.scale(delta_time);
    this.position.add(TEMP_DELTA_POSITION);
  }

  clamp_to(rectangle) {
    const position = this.position;
    position.x = clamp(position.x, rectangle.left, rectangle.right - 1);
    position.y = clamp(position.y, rectangle.top, rectangle.bottom - 1);
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
      position.y + velocity.y
    );
    p.stroke(0, 255, 0);
    p.line(
      position.x,
      position.y,
      position.x + acceleration.x,
      position.y + acceleration.y
    );

    p.stroke(255, 127, 0);
    p.point(position.x, position.y);
  }
}
