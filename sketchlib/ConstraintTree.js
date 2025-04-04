import { Point } from "../pga2d/objects.js";
import { Motor } from "../pga2d/versors.js";
import { is_nearly } from "./is_nearly.js";
import { Particle } from "./Particle.js";

export class Constraint {
  /**
   * A constraint that a value must be between [min, max]
   * @param {number} minimum The minimum value
   * @param {number} maximum The maximum value
   */
  constructor(minimum, maximum) {
    this.minimum = minimum;
    this.maximum = maximum;
  }
}

const ROT90 = Motor.rotation(Point.ORIGIN, Math.PI / 2);

/**
 * Take two unit directions and compute the direction halfway between.
 * @param {Point} a The first unit direction
 * @param {Point} b The first unit direction
 * @param {Point} tiebreak If the vectors are at 180 degrees, return this
 * direction
 * @return {Point} The halfway direction as a unit direction
 */
function halfway(a, b, tiebreak) {
  if (is_nearly(a.dot(b), -1)) {
    return tiebreak;
  }

  return a.add(b).normalize();
}

export class ConstraintJoint {
  /**
   *
   * @param {Point} position - Initial position as a point
   * @param {Point} orientation - A unit direction pointing in the "forwards" direction
   * @param {number} body_radius The radius of the body
   * @param {Constraint} [length_constraint] The length constraint
   * @param {Constraint} [angle_constraint] Angle constraint [theta_min, theta_max], measured CCW from the relative backwards direction
   * @param {ConstraintJoint[]} [children] Children
   */
  constructor(
    position,
    orientation,
    body_radius,
    length_constraint,
    angle_constraint,
    children
  ) {
    this.position = position;
    this.orientation = orientation;
    this.length_constraint = length_constraint;
    this.angle_constraint = angle_constraint;
    this.body_radius = body_radius;
    this.children = children ?? [];
  }

  /**
   * Do an inorder traversal of the tree, placing vertices based on the radii
   * of each joint to outline the tree. It's up to the caller
   * @param {Point[]} output The output array to populate
   * @param {ConstraintJoint} [parent] The parent node. For the root node, pass in undefined
   */
  get_outline_vertices(output, parent) {
    // Four cardinal directions from the perspective of this point
    const dir_forward = this.orientation;
    const dir_backward = dir_forward.neg();
    const dir_left = ROT90.transform_point(dir_forward);
    const dir_right = ROT90.transform_point(dir_backward);

    // root node puts a vertex at the top to complete the loop
    if (parent === undefined) {
      const root_tip = this.position.add(dir_forward.scale(this.body_radius));
      output.push(root_tip);
    }

    // Leaf node puts a vertex to the left, bottom and right
    if (this.children.length === 0) {
      const point_left = this.position.add(dir_left.scale(this.body_radius));
      const point_back = this.position.add(
        dir_backward.scale(this.body_radius)
      );
      const point_right = this.position.add(dir_right.scale(this.body_radius));

      output.push(point_left, point_back, point_right);
      return;
    }

    // Interior node ------------------------------------

    // Get the direction to each child
    const to_children = this.children.map((child) =>
      child.position.sub(this.position).normalize()
    );

    // Point on the left, placed at the half angle between the forward
    // direction and the direction to the child
    const dir_before = halfway(dir_forward, to_children[0], dir_left);
    const before_point = this.position.add(dir_before.scale(this.body_radius));
    output.push(before_point);

    // Recurse to the first child
    this.children[0].get_outline_vertices(output, this);

    // Points between pairs of children

    // Point on the right after all the children
    const dir_after = halfway(
      dir_forward,
      to_children[to_children.length - 1],
      dir_right
    );
    const after_point = this.position.add(dir_after.scale(this.body_radius));
    output.push(after_point);

    // Recursively put the list of points together
    // output.push(before_point)
    // children[0].get_outline_vertices(output, this)
    // for remaining children i=1...n-1:
    //    output.push(between_points[i - 1])
    //    children[i].get_outline_vertice(output, this)
    // output.push(after_point)
  }

  /**
   * Get the edges of the tree
   * @param {[Point, Point][]} result The list of edges to populate
   */
  get_edges(result) {
    for (const child of this.children) {
      result.push([child.position, this.position]);

      child.get_edges(result);
    }
  }
}

export class ConstraintTree {
  /**
   * A tree of joints
   * @param {ConstraintJoint} root The root node of the tree
   */
  constructor(root) {
    this.root = root;
    this.particle = new Particle(this.root.position, Point.ZERO);
  }

  update() {}

  /**
   * Get the vertices for an outline of the tree. These can be interpolated
   * with a smooth curve.
   * @returns {Point[]} vertices
   */
  get_outline_vertices() {
    const result = [];
    this.root.get_outline_vertices(result);
    return result;
  }

  /**
   *
   * @returns {[Point, Point][]}
   */
  get_tree_edges() {
    const result = [];
    this.root.get_edges(result);
    return result;
  }
}
