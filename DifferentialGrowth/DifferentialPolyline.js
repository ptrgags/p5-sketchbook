import { Point } from "../pga2d/objects.js";
import {
  BeziergonPrimitive,
  PolygonPrimitive,
} from "../sketchlib/rendering/primitives.js";
import { Random } from "../sketchlib/random.js";
import { Vector2 } from "./Vector2.js";
import { DifferentialNode, NEARBY_RADIUS } from "./DifferentialNode.js";
import { Circle } from "./circle.js";
import { mod } from "../sketchlib/mod.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { GroupPrimitive } from "../sketchlib/rendering/GroupPrimitive.js";

const MAX_EDGE_LENGTH = 150;

const MAX_POINTS_PER_POLYLINE = 1000;

// How small of an angle below which more nodes will be added
const PINCH_ANGLE_THRESHOLD = Math.PI / 6;
const PINCH_THRESHOLD = Math.cos(Math.PI / 4);

const MAX_SPEED = 10;
const MAX_FORCE = 20;

// Attraction between neighboring points is modeled like springs.
const ATTRACTION_MIN_DISTANCE = 20;

// Temporary accumulators since vectors are added in-place
const TEMP_DESIRED_VELOCITY = new Vector2();
const TEMP_STEERING_FORCE = new Vector2();
const TEMP_TOTAL_FORCE = new Vector2();
const TEMP_ATTRACTION = new Vector2();
const TEMP_REPULSION = new Vector2();
const TEMP_BA = new Vector2();
const TEMP_BC = new Vector2();

export class DifferentialPolyline {
  constructor(positions_array, quadtree) {
    this.nodes = positions_array.map((v) => new DifferentialNode(v));

    // fix the endpoints
    //this.nodes[0].fixed = true;
    //this.nodes[positions_array.length - 1].fixed = true;

    this.quadtree = quadtree;
    for (const node of this.nodes) {
      this.quadtree.insert_point(node);
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

      TEMP_BA.clone_from(a);
      TEMP_BA.sub(b);
      TEMP_BA.normalize();

      TEMP_BC.clone_from(c);
      TEMP_BC.sub(b);
      TEMP_BC.normalize();

      // The angle between two vectors is between 0 and 180 degrees.
      // angles >= 90 aren't too bad
      // angles < 90 get more and more pinched. I'm leaving the exact
      // threshold as a parameter
      const cos_angle = Vector2.dot(TEMP_BA, TEMP_BC);
      if (cos_angle > PINCH_THRESHOLD) {
        split_points.push(i);
      }
    }

    for (let i = 0; i < split_points.length; i++) {
      const index = split_points[split_points.length - 1 - i];
      this.add_point(index);
    }
  }

  add_point(index) {
    if (index < 0 || index >= this.nodes.length) {
      throw new Error("OUT OF BOUNDS");
    }

    const before = this.nodes[index];
    const after = this.nodes[(index + 1) % this.nodes.length];
    const midpoint = new Vector2();
    midpoint.clone_from(before.position);
    midpoint.add(after.position);
    midpoint.scale(0.5);

    const point = new DifferentialNode(midpoint);
    this.nodes.splice(index + 1, 0, point);
    this.quadtree.insert_point(point);
  }

  add_random_point() {
    const index = Random.rand_int(0, this.nodes.length);
    this.add_point(index);
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
    this.compute_attraction(
      TEMP_TOTAL_FORCE,
      node,
      mod(index - 1, this.nodes.length)
    );
    this.compute_attraction(
      TEMP_TOTAL_FORCE,
      node,
      (index + 1) % this.nodes.length
    );
    this.compute_repulsion(TEMP_TOTAL_FORCE, node);
    //this.compute_containment(TEMP_TOTAL_FORCE, node);

    node.apply_forces(TEMP_TOTAL_FORCE, delta_time);
  }

  update(delta_time) {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      this.compute_forces(node, i, delta_time);
      node.clamp_to(this.quadtree.bounds);
      node.check_if_dirty();
    }
  }

  make_curve(style) {
    const positions = this.nodes.map((node) =>
      Point.point(node.position.x, node.position.y)
    );

    const beziergon = BeziergonPrimitive.interpolate_points(positions);
    return new GroupPrimitive(beziergon, { style });
  }

  make_polyline(style) {
    const vertices = this.nodes.map((x) =>
      Point.point(x.position.x, x.position.y)
    );
    const polygon = new PolygonPrimitive(vertices);
    return new GroupPrimitive(polygon, { style });
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
