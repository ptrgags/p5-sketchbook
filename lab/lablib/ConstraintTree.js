import { Point } from "../../pga2d/objects.js";
import { Motor } from "../../pga2d/versors.js";
import { clamp } from "../../sketchlib/clamp.js";
import { is_nearly } from "../../sketchlib/is_nearly.js";
import { Particle } from "../../sketchlib/Particle.js";
import { CirclePrimitive, GroupPrimitive, LinePrimitive, VectorPrimitive } from "../../sketchlib/primitives.js";
import { Style } from "../../sketchlib/Style.js";

export class AngleConstraint {
  /**
   * Constructor
   * @param {number} theta1 Minimum angle
   * @param {number} theta2 Maximum angle
   */
  constructor(theta1, theta2) {
    this.theta1 = theta1;
    this.theta2 = theta2;
  }

  /**
   * Instead of [theta1, theta2], specify the constraint as angle +/- spread
   * @param {number} angle The angle of the center of the range in radians
   * @param {number} spread positive angle from center of range to the CCW max angle
   */
  static from_angle_spread(angle, spread) {
    const theta1 = angle - spread;
    const theta2 = angle + spread;
    return new AngleConstraint(theta1, theta2);
  }

  /**
   *
   * @param {Point} dir_backward The "backwards" direction relative to the parent node
   * @param {Point} dir_current The current direction from the parent node to the child node
   * @returns {Point} the constrained direction
   */
  constrain(dir_backward, dir_current) {
    const dir_left = Motor.rotation(Point.ORIGIN, this.theta1).transform_point(
      dir_backward
    );

    if (this.theta1 === this.theta2) {
      return dir_left;
    }

    const dir_right = Motor.rotation(Point.ORIGIN, this.theta2).transform_point(
      dir_backward
    );

    // Get the sign of the angle between the current direction and the
    // left/right boundaries. If both of these are positive, we're within
    // the bounds and should keep the same angle. Otherwise, snap to the
    // closest boundary
    const left_sin = dir_left.join(dir_current).ideal_norm();
    const right_sin = dir_current.join(dir_right).ideal_norm();

    if (left_sin > 0 || right_sin > 0) {
      return dir_current;
    }

    const left_dot = dir_left.dot(dir_current);
    const right_dot = dir_right.dot(dir_current);

    if (left_dot > right_dot) {
      return dir_left;
    } else {
      return dir_right;
    }
  }
}

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
 * Take two unit directions and compute the direction halfway between
 * @param {Point} a The first unit direction
 * @param {Point} b The first unit direction
 * @param {Point} tiebreak If the vectors are at 180 degrees, return this
 * direction
 * @return {Point} The halfway direction CCW from a to b as a unit direction
 */
function halfway(a, b, tiebreak) {
  // Tie break for straight angles
  if (is_nearly(a.dot(b), -1)) {
    return tiebreak;
  }

  const { x: ax, y: ay } = a;
  const { x: bx, y: by } = b;
  const sign_vee = Math.sign(ax * by - ay * bx);
  if (sign_vee < 1) {
    return a.add(b).normalize();
  }

  return a.add(b).normalize().neg();
}

export class ConstraintJoint {
  /**
   * Constructor
   * @param {Point} position - Initial position as a point
   * @param {Point} orientation - A unit direction pointing in the "forwards" direction
   * @param {number} body_radius The radius of the body
   * @param {Constraint} [length_constraint] The length constraint
   * @param {AngleConstraint} [angle_constraint] Angle constraint [theta_min, theta_max], measured CCW from the relative backwards direction
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
   * Move the root node to a target, and have all the other nodes follow it.
   * @param {Point} target The point to move to
   */
  follow_root(target) {
    // If we moved to a new point, move the node and rotate to face the
    // target. Otherwise, just stay put
    if (!target.equals(this.position)) {
      this.orientation = target.sub(this.position).normalize();
      this.position = target;
    }

    for (const child of this.children) {
      child.follow_recursive(this);
    }
  }

  /**
   * Following method for all the nodes of the tree except the root.
   * @param {ConstraintJoint} parent The parent node to follow
   */
  follow_recursive(parent) {
    const from_parent = this.position.sub(parent.position);
    const dir_from_parent = from_parent.normalize();
    const dist_from_parent = from_parent.ideal_norm();

    // Angle constraint =============================================

    // Relative to the parent's orientation, the angle constraint is measured
    // from the "backwards" direction - a positive angle is CCW from there,
    // a negative one is CW. Let's find directions for the left and right
    // constraint bounds
    /*const backward = parent.orientation.neg();
    const { minimum: theta1, maximum: theta2 } = this.angle_constraint;
    const dir_left = Motor.rotation(Point.ORIGIN, theta1).transform_point(
      backward
    );
    const dir_right = Motor.rotation(Point.ORIGIN, theta2).transform_point(
      backward
    );

    // Get the sign of the angle between the current direction and the
    // left/right boundaries. If both of these are positive, we're within
    // the bounds and should keep the same angle. Otherwise, snap to the
    // closest boundary
    const left_sin = dir_left.join(dir_from_parent).ideal_norm();
    const right_sin = dir_from_parent.join(dir_right).ideal_norm();

    let direction;
    if (left_sin > 0 || right_sin > 0) {
      direction = dir_from_parent;
    } else if (Math.abs(left_sin) < Math.abs(right_sin)) {
      direction = dir_left;
    } else {
      direction = dir_right;
    }
      */

    const dir_backward = parent.orientation.neg();
    const direction = this.angle_constraint.constrain(
      dir_backward,
      dir_from_parent
    );

    // Length constraint =============================================

    // This one's easier, just clamp the length to range
    const { minimum: r1, maximum: r2 } = this.length_constraint;
    const length = clamp(dist_from_parent, r1, r2);

    // Update joint ==================================================

    this.orientation = direction.neg();
    const offset = direction.scale(length);
    this.position = parent.position.add(offset);

    for (const child of this.children) {
      child.follow_recursive(this);
    }
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
    const dir_left = ROT90.transform_point(dir_forward).neg();
    const dir_right = ROT90.transform_point(dir_backward).neg();

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

    // For additional branches, interleave a vertex between the branches with the recursive calls.
    for (let i = 1; i < this.children.length; i++) {
      const dir_left_child = to_children[i - 1];
      const dir_right_child = to_children[i];
      const dir_between = halfway(
        dir_left_child,
        dir_right_child,
        dir_backward
      );
      const between_point = this.position.add(
        dir_between.scale(this.body_radius)
      );
      output.push(between_point);

      this.children[i].get_outline_vertices(output, this);
    }

    // Point on the right after all the children
    const dir_after = halfway(
      to_children[to_children.length - 1],
      dir_forward,
      dir_right
    );
    const after_point = this.position.add(dir_after.scale(this.body_radius));
    output.push(after_point);
  }

  /**
   * Get the edges (parent, child) for the tree
   * @param {[ConstraintJoint, ConstraintJoint][]} result The list of edges to populate
   */
  get_edges(result) {
    for (const child of this.children) {
      result.push([this, child]);

      child.get_edges(result);
    }
  }

  /**
   * Gather up all joints into a single list
   * @param {ConstraintJoint[]} joints The joints to render
   */
  get_all_joints(joints) {
    joints.push(this);

    for (const child of this.children) {
      child.get_all_joints(joints)
    }
  }
}

export class ConstraintTree {
  /**
   * A tree of joints
   * @param {ConstraintJoint} root The root node of the tree
   * @param {number} max_acceleration maximum acceleration of the root node
   */
  constructor(root, max_acceleration) {
    this.root = root;
    this.particle = new Particle(this.root.position, Point.ZERO);
    this.max_acceleration = max_acceleration;
  }

  /**
   * Update the animation for this frame
   * @param {Point} target The destination point
   * @param {number} dt The time delta
   */
  update(target, dt) {
    /*
    const position = this.root.position;
    const acceleration = target.sub(position).set_length(this.max_acceleration);
    this.particle.update(dt, acceleration);
    */

    //this.root.follow_root(this.particle.position);
    this.root.follow_root(target);
  }

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
   * @returns {[ConstraintJoint, ConstraintJoint][]}
   */
  get_tree_edges() {
    const result = [];
    this.root.get_edges(result);
    return result;
  }

  debug_render() {
    const joints = [];
    this.root.get_all_joints(joints);

    const circle_prims = joints.map(joint => {
      return new CirclePrimitive(joint.position, joint.body_radius);
    })
    const circles = new GroupPrimitive(circle_prims, Style.DEFAULT_STROKE);

    const orientation_prims = joints.map(joint => {
      const offset = joint.orientation.scale(30);
      return new VectorPrimitive(joint.position, joint.position.add(offset));
    })
    const orientation_vectors = new GroupPrimitive(orientation_prims, Style.DEFAULT_STROKE);

    const edges = [];
    this.root.get_edges(edges);

    const LINE_LENGTH = 40;
    const angle_lines = edges.flatMap(([parent, child]) => {
      const center = parent.position;
      const backwards = parent.orientation.neg();
      const { theta1, theta2 } = child.angle_constraint;
      const left = Motor.rotation(Point.ORIGIN, theta1).transform_point(backwards);
      const right = Motor.rotation(Point.ORIGIN, theta2).transform_point(backwards);


      const left_end = center.add(left.scale(LINE_LENGTH));
      const right_end = center.add(right.scale(LINE_LENGTH));
      return [
        new LinePrimitive(center, left_end),
        new LinePrimitive(center, right_end)
      ]
    })
    const group_angles = new GroupPrimitive(angle_lines, Style.DEFAULT_STROKE);

    return new GroupPrimitive([
      circles,
      group_angles,
      orientation_vectors
    ])
  }
}
