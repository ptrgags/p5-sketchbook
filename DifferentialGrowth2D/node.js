const GROWTH_RATE = 0.1;

function clamp(x, min_val, max_val) {
  return Math.max(Math.min(x, max_val), min_val);
}

const TEMP_DELTA_VELOCITY = new Vector2(0, 0);
const TEMP_DELTA_POSITION = new Vector2(0, 0);
class DifferentialNode {
  constructor(position) {
    this.position = position;
    this.velocity = new Vector2(0, 0);
    this.acceleration = new Vector2(0, 0);
    this.mass = 100.0;
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
    position.x = clamp(position.x, rectangle.left, rectangle.right);
    position.y = clamp(position.y, rectangle.top, rectangle.bottom);
  }
  
  check_if_dirty() {
    if (!this.quadtree_node.bounds.contains(this)) {
      this.is_dirty = true;
    }
  }
  
  grow() {
    this.mass += GROWTH_RATE;
  }
  
  // for debugging
  draw() {
    strokeWeight(3);
    noFill();
    stroke(255, 127, 0);
    point(this.x, this.y);
  }
}
