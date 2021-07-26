const MAX_SPEED = 10;
const MAX_FORCE = 10;

// Attraction between neighboring points is modeled like springs.
const ATTRACTION_MIN_DISTANCE = 50;

// Radius of points to check when computing repulsion
//const REPULSION_AMOUNT = 1e4;
const NEARBY_RADIUS = 50;



// Temporary accumulators since vectors are added in-place
const TEMP_DESIRED_VELOCITY = new Vector2();
const TEMP_STEERING_FORCE = new Vector2();
const TEMP_TOTAL_FORCE = new Vector2();
const TEMP_ATTRACTION = new Vector2();
const TEMP_REPULSION = new Vector2();

// Because JavaScript doesn't handle the modulo operator
// correctly for negative numbers
function fixed_modulo(x, modulus) {
  return ((x % modulus) + modulus) % modulus; 
}

class DifferentialPolyline {
  constructor(positions_array, quadtree) {
    this.nodes = positions_array.map(([x, y]) => {
      const position = new Vector2(x, y);
      return new DifferentialNode(position);
    });
    
    // fix the endpoints
    //this.nodes[0].fixed = true;
    //this.nodes[positions_array.length - 1].fixed = true;
    
    this.quadtree = quadtree;
    for (const node of this.nodes) {
      this.quadtree.insert_point(node);
    }
  }
  
  add_point(index) {
    if (index >= this.nodes.length - 1) {
      throw new Error("OUT OF BOUNDS");
    }
    const before = this.nodes[index];
    const after = this.nodes[index + 1];
    const midpoint = new Vector2(0, 0);
    midpoint.clone_from(before.position);
    midpoint.add(after.position);
    midpoint.scale(0.5);
    
    const point = new DifferentialNode(midpoint);
    this.nodes.splice(index + 1, 0, point);
    this.quadtree.insert_point(point);
  }
  
  compute_attraction(total_force, node, neighbor_index) {
    const start = node;
    const end = this.nodes[neighbor_index];
    
    // r = end - start
    TEMP_DESIRED_VELOCITY.clone_from(end.position);
    TEMP_DESIRED_VELOCITY.sub(start.position);
    
    // Only apply attraction if the points get far apart
    const distance = TEMP_DESIRED_VELOCITY.get_length();
    if (distance < ATTRACTION_MIN_DISTANCE) {
      return;
    }
    
    TEMP_DESIRED_VELOCITY.limit(MAX_SPEED);
    
    
    TEMP_STEERING_FORCE.clone_from(TEMP_DESIRED_VELOCITY);
    TEMP_STEERING_FORCE.sub(node.velocity);
    TEMP_STEERING_FORCE.limit(MAX_FORCE);
    
    total_force.add(TEMP_STEERING_FORCE);
  }
  
  compute_repulsion(total_force, node) {
    const circle = new Circle(node.position, NEARBY_RADIUS);
    const nearby_points = this.quadtree.circle_query(circle);
    
    let count = 0;
    // desired repulsion velocity is the average direction "away" from neighbor points
    TEMP_DESIRED_VELOCITY.set_zero();
    for (const nearby_point of nearby_points) {
      if (nearby_point === node) {
        continue;
      }
      
      // r = point - nearby_point
      // we want r_dir = normalize(r)
      TEMP_REPULSION.clone_from(node.position);
      TEMP_REPULSION.sub(nearby_point.position);
      TEMP_REPULSION.normalize();
      
      // update sum and count
      TEMP_DESIRED_VELOCITY.add(TEMP_REPULSION);
    }
    
    // We don't actually need to compute the average, just set the magnitude
    // to the max speed
    if (count > 0) {
      TEMP_DESIRED_VELOCITY.set_magnitude(MAX_SPEED);
    }
    
    TEMP_STEERING_FORCE.clone_from(TEMP_DESIRED_VELOCITY);
    TEMP_STEERING_FORCE.sub(node.velocity);
    TEMP_STEERING_FORCE.limit(MAX_FORCE);
    
    total_force.add(TEMP_STEERING_FORCE);
  }
  
  compute_containment(total_force, node) {
    // Stay within a circular boundary
    const BOUNDARY_CENTER = new Vector2(WIDTH / 2, HEIGHT / 2);
    const BOUNDARY_RADIUS = 150; 
    
    TEMP_DESIRED_VELOCITY.clone_from(node.position);
    TEMP_DESIRED_VELOCITY.sub(BOUNDARY_CENTER);
    const distance = TEMP_DESIRED_VELOCITY.get_length();
    
    if (distance <= BOUNDARY_RADIUS) {
      return;
    }
    
    TEMP_DESIRED_VELOCITY.scale(-1);
    
    // TODO: I see a pattern here.
    TEMP_STEERING_FORCE.clone_from(TEMP_DESIRED_VELOCITY);
    TEMP_STEERING_FORCE.sub(node.velocity);
    TEMP_STEERING_FORCE.limit(MAX_FORCE);
    total_force.add(TEMP_STEERING_FORCE);
  }
  
  compute_forces(node, index, delta_time) {
    // fixed nodes do not move
    if (node.fixed) {
      return;
    }
    
    TEMP_TOTAL_FORCE.set_zero();
    this.compute_attraction(TEMP_TOTAL_FORCE, node, fixed_modulo(index - 1, this.nodes.length));
    this.compute_attraction(TEMP_TOTAL_FORCE, node, (index + 1) % this.nodes.length);
    this.compute_repulsion(TEMP_TOTAL_FORCE, node);
    //this.compute_containment(TEMP_TOTAL_FORCE, node);
    
    node.apply_forces(TEMP_TOTAL_FORCE, delta_time);
  }
  
  update(delta_time) {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      this.compute_forces(node, i, delta_time);
      node.clamp_to(QUADTREE.bounds);
      node.check_if_dirty();
    }
  }
  
  draw() {
    fill(255, 0, 0);
    stroke(255, 255, 0);
    strokeWeight(2.5);
    beginShape();
    for (const node of this.nodes) {
      const position = node.position;
      vertex(position.x, position.y);
    }
    /*
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const start = this.nodes[i].position;
      const end = this.nodes[i + 1].position;
      vertex(start.x, start.y, end.x, end.y);
    }
    */
    endShape(CLOSE);
  }
}
