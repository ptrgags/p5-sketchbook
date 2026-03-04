import { Random } from "../sketchlib/random.js";
import { Vector2 } from "./Vector2.js";
import { DifferentialNode, NEARBY_RADIUS } from "./DifferentialNode.js";
import { mod } from "../sketchlib/mod.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { style } from "../sketchlib/primitives/shorthand.js";
import { BeziergonPrimitive } from "../sketchlib/primitives/BeziergonPrimitive.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Quadtree } from "./quadtree.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { Style } from "../sketchlib/Style.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";

const MAX_EDGE_LENGTH = 150;

// How small of an angle below which more nodes will be added
const PINCH_THRESHOLD = Math.cos(Math.PI / 4);

const MAX_SPEED = 10;
const MAX_FORCE = 20;

// Attraction between neighboring points is modeled like springs.
const ATTRACTION_MIN_DISTANCE = 20;

/**
 * Compute a steering force
 * See https://natureofcode.com/autonomous-agents/#vehicles-and-steering
 * @param {Direction} desired_velocity Desired velocity
 * @param {Direction} velocity Current velocity
 * @param {number} max_force Max magnitude of force vector
 * @returns {Direction} Steering force
 */
function steering_force(desired_velocity, velocity, max_force) {
  return desired_velocity.sub(velocity).limit_length(max_force);
}

export class DifferentialPolyline {
  /**
   *
   * @param {Point[]} positions_array
   * @param {Quadtree} quadtree
   */
  constructor(positions_array, quadtree) {
    this.nodes = positions_array.map((v) => new DifferentialNode(v));

    // fix the endpoints
    //this.nodes[0].fixed = true;
    //this.nodes[positions_array.length - 1].fixed = true;

    this.quadtree = quadtree;
    for (const node of this.nodes) {
      this.quadtree.insert_node(node);
    }
  }

  split_long_edges() {
    for (let i = 0; i < this.nodes.length; i++) {
      const start = this.nodes[i];
      const end = this.nodes[(i + 1) % this.nodes.length];
      const edge_length = Vector2.distance(start.position, end.position);
      if (edge_length > MAX_EDGE_LENGTH) {
        this.add_point(i);
      }
    }
  }

  split_pinched_angles() {
    const split_points = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const a_index = mod(i - 1, this.nodes.length);
      const a = this.nodes[a_index].position;
      const b = this.nodes[i].position;
      const c = this.nodes[(i + 1) % this.nodes.length].position;

      const ba = a.sub(b).normalize();
      const bc = c.sub(b).normalize();

      // The angle between two vectors is between 0 and 180 degrees.
      // angles >= 90 aren't too bad
      // angles < 90 get more and more pinched. I'm leaving the exact
      // threshold as a parameter
      const cos_angle = ba.dot(bc);
      if (cos_angle > PINCH_THRESHOLD) {
        split_points.push(i);
      }
    }

    for (let i = 0; i < split_points.length; i++) {
      const index = split_points[split_points.length - 1 - i];
      this.add_point(index);
    }
  }

  /**
   * Add a new point at the given index of the array at the midpoint of the
   * adjacent indices
   * @param {number} index
   */
  add_point(index) {
    if (index < 0 || index >= this.nodes.length) {
      throw new Error("OUT OF BOUNDS");
    }

    const before = this.nodes[index];
    const after = this.nodes[(index + 1) % this.nodes.length];
    const midpoint = Point.lerp(before.position, after.position, 0.5);

    const node = new DifferentialNode(midpoint);
    this.nodes.splice(index + 1, 0, node);
    this.quadtree.insert_node(node);
  }

  add_random_point() {
    const index = Random.rand_int(0, this.nodes.length);
    this.add_point(index);
  }

  /**
   *
   * @param {DifferentialNode} node
   * @param {number} neighbor_index
   * @returns {Direction}
   */
  compute_attraction(node, neighbor_index) {
    const start = node;
    const end = this.nodes[neighbor_index];

    // r = end - start
    let desired_velocity = end.position.sub(start.position);

    // Only apply attraction if the points get far apart
    const distance_sqr = desired_velocity.mag_sqr();
    if (distance_sqr < ATTRACTION_MIN_DISTANCE * ATTRACTION_MIN_DISTANCE) {
      return Direction.ZERO;
    }

    desired_velocity = desired_velocity.limit_length(MAX_SPEED);

    return steering_force(desired_velocity, node.velocity, MAX_FORCE);
  }

  /**
   *
   * @param {DifferentialNode} node
   * @returns {Direction}
   */
  compute_repulsion(node) {
    const circle = new Circle(node.position, NEARBY_RADIUS);
    const nearby_points = this.quadtree.circle_query(circle);

    let count = 0;
    // desired repulsion velocity is the average direction "away" from neighbor points
    let desired_velocity = Direction.ZERO;
    for (const nearby_point of nearby_points) {
      if (nearby_point === node) {
        continue;
      }

      // r = point - nearby_point
      // we want r_dir = normalize(r)
      const repulsion = node.position.sub(nearby_point.position).normalize();

      // update sum and count
      desired_velocity = desired_velocity.add(repulsion);
      count++;
    }

    // We don't actually need to compute the average, just set the magnitude
    // to the max speed
    if (count > 0) {
      desired_velocity = desired_velocity.set_length(MAX_SPEED);
    }

    return steering_force(desired_velocity, node.velocity, MAX_FORCE);
  }

  /**
   *
   * @param {DifferentialNode} node
   * @returns {Direction} direction representing the steering force
   */
  compute_containment(node) {
    // Stay within a circular boundary
    const BOUNDARY_CENTER = new Point(WIDTH / 2, HEIGHT / 2);
    const BOUNDARY_RADIUS = 150;

    let desired_velocity = node.position.sub(BOUNDARY_CENTER).neg();
    const distance_sqr = desired_velocity.mag_sqr();
    if (distance_sqr <= BOUNDARY_RADIUS * BOUNDARY_RADIUS) {
      return Direction.ZERO;
    }

    return steering_force(desired_velocity, node.velocity, MAX_FORCE);
  }

  /**
   *
   * @param {DifferentialNode} node
   * @param {number} index
   * @param {number} delta_time
   * @returns
   */
  compute_forces(node, index, delta_time) {
    // fixed nodes do not move
    if (node.fixed) {
      return;
    }

    const attraction_prev = this.compute_attraction(
      node,
      mod(index - 1, this.nodes.length),
    );
    const attraction_next = this.compute_attraction(
      node,
      (index + 1) % this.nodes.length,
    );
    const repulsion = this.compute_repulsion(node);
    //this.compute_containment(node);

    const net_force = attraction_prev.add(attraction_next).add(repulsion);

    node.apply_forces(net_force, delta_time);
  }

  /**
   *
   * @param {number} delta_time
   */
  update(delta_time) {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      this.compute_forces(node, i, delta_time);
      node.clamp_to(this.quadtree.bounds);
      node.check_if_dirty();
    }
  }

  /**
   * Make a beziergon curve
   * @param {Style} line_style
   * @returns {GroupPrimitive} Styled beziergon
   */
  make_curve(line_style) {
    const positions = this.nodes.map((node) => node.position);
    const beziergon = BeziergonPrimitive.interpolate_points(positions);
    return style(beziergon, line_style);
  }

  /**
   * Make a polygon for debugging
   * @param {Style} line_style
   * @returns {GroupPrimitive} Styled polyline
   */
  make_polyline(line_style) {
    const vertices = this.nodes.map(
      (x) => new Point(x.position.x, x.position.y),
    );
    const polygon = new PolygonPrimitive(vertices, true);
    return style(polygon, line_style);
  }

  draw(p, fill_color) {
    p.fill(fill_color);
    p.stroke(255, 255, 0);
    p.strokeWeight(2.5);
    p.beginShape();
    for (const node of this.nodes) {
      const position = node.position;
      p.vertex(position.x, position.y);
    }
    p.endShape(p.CLOSE);
  }
}
