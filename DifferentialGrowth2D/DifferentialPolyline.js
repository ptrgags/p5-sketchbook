// Attraction between neighboring points is modeled like springs.
const SPRING_STIFFNESS = 0.1;
const SPRING_REST_LENGTH = 50;

// Radius of points to check when computing repulsion
const NEARBY_RADIUS = 50;

// Temporary accumulators since vectors are added in-place
const TEMP_TOTAL_FORCE = new Vector2(0, 0);
const TEMP_ATTRACTION = new Vector2(0, 0);

class DifferentialPolyline {
  constructor(positions_array, quadtree) {
    this.nodes = positions_array.map(([x, y]) => {
      const position = new Vector2(x, y);
      return new DifferentialNode(position);
    });
    
    // fix the endpoints
    this.nodes[0].fixed = true;
    this.nodes[positions_array.length - 1].fixed = true;
    
    this.quadtree = quadtree;
    for (const node of this.nodes) {
      this.quadtree.insert_point(node);
    }
  }
  
  compute_attraction(total_force, node, neighbor_index) {
    const start = this.nodes[neighbor_index];
    const end = node;
    
    // Compute the direction vector r from start -> end
    // but separate it into magnitude and direction:
    // r = |r| * r_dir
    // 
    // by the end of this block:
    // distance = |r|
    // TEMP_ATTRACTION = r_dir
    TEMP_ATTRACTION.clone_from(end.position);
    TEMP_ATTRACTION.sub(start.position);
    const distance = TEMP_ATTRACTION.get_length();
    TEMP_ATTRACTION.scale(1.0 / distance);
    
    // The attraction force is modeled like a spring
    // F = -k * x
    // where k is the spring constant (SPRING_STIFFNESS)
    // and x is the displacement from the rest length:
    // x = (|r| - rest_length) r_dir;
    //
    // TEMP
    const spring_displacement = distance - SPRING_REST_LENGTH;
    TEMP_ATTRACTION.scale(-SPRING_STIFFNESS * spring_displacement);
    
    total_force.add(TEMP_ATTRACTION);
  }
  
  compute_repulsion(total_force, node) {
    const circle = new Circle(node.position, NEARBY_RADIUS);
    const nearby_points = this.quadtree.circle_query(circle);
    
    // Repulsion is modeled as an inverse-square law
    // r = point - nearby_point
    // F = (k / |r|^2) r_dir
    //   = (k / |r|^3) r
    for (const nearby_point of nearby_points) {
      // compute the displacement r from nearby_point -> point
      TEMP_REPULSION.clone_from(node.position);
      TEMP_REPULSION.sub(nearby_point.position);
      
      // compute the force 
      const distance = TEMP_REPULSION.get_length();
      const scalar = REPULSION_AMOUNT / (distance * distance * distance);
      TEMP_REPULSION.scale(scalar);
      
      total_force.add(TEMP_REPULSION);
    }
  }
  
  compute_forces(node, index, delta_time) {
    // endpoints are fixed
    if (node.fixed) {
      return;
    }
    
    TEMP_TOTAL_FORCE.set_zero();
    this.compute_attraction(TEMP_TOTAL_FORCE, node, index - 1);
    this.compute_attraction(TEMP_TOTAL_FORCE, node, index + 1);
    this.compute_repulsion(TEMP_TOTAL_FORCE, node);
    
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
    noFill();
    stroke(255, 255, 0);
    strokeWeight(1);
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const start = this.nodes[i].position;
      const end = this.nodes[i + 1].position;
      line(start.x, start.y, end.x, end.y);
    }
  }
}
