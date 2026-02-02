import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Motor } from "../sketchlib/pga2d/versors.js";
import { is_nearly } from "../sketchlib/is_nearly.js";
import { BeziergonPrimitive } from "../sketchlib/primitives/BeziergonPrimitive.js";
import { Circle } from "../sketchlib/primitives/CirclePrimitive.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { group } from "../sketchlib/primitives/shorthand.js";

/**
 * Take two unit directions and compute the direction halfway between
 * @param {Direction} a The first unit direction
 * @param {Direction} b The second unit direction
 * @param {Direction} tiebreak If the vectors are at 180 degrees, return this
 * direction
 * @return {Direction} The halfway direction CCW from a to b as a unit direction
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

function get_forward_dir(node, parent) {
  if (parent) {
    return parent.circle.position.sub(node.circle.position).normalize();
  }

  if (node.children.length === 1) {
    return node.circle.position
      .sub(node.children[0].circle.position)
      .normalize();
  }

  // TODO: For a root with multiple children, maybe take the average of the
  // children directions and negate it? not needed yet.

  // Only a single root node, the direction is arbitrary.
  return Direction.DIR_X;
}

/**
 * @typedef {{
 *  left?: boolean,
 *  right?: boolean
 *  between?: boolean[]
 * }} SkipSettings
 */

/**
 * Make an array of boolean flags (all false) equal to num_children.length - 1
 * (or an empty array if there are no children)
 * @param {number} num_children
 * @return {boolean[]}
 */
function make_skip_between(num_children) {
  if (num_children < 2) {
    return [];
  }

  return new Array(num_children - 1).fill(false);
}

export class CoralNode {
  /**
   * Constructor
   * @param {Circle} circle The circle for the boundary
   * @param {CoralNode[]} children Child nodes
   * @param {SkipSettings} skip A dictionary of points to skip when drawing the
   * curve. This can make more interesting coral shapes.
   */
  constructor(circle, children = [], skip = {}) {
    this.circle = circle;
    this.children = children;

    this.skip_left = skip.left ?? false;
    this.skip_right = skip.right ?? false;
    this.skip_between = skip.between ?? make_skip_between(children.length);

    this.skip = skip;
  }

  /**
   * Do an inorder traversal of the tree, placing vertices based on the
   * circle radii. The skip settings from the constructor are used to
   * skip some points to tweak the shape the way I like
   * @param {Point[]} output Output vertices to populate
   * @param {CoralNode} [parent] The parent node
   */
  get_outline_vertices(output, parent) {
    const center = this.circle.position;
    const radius = this.circle.radius;

    const dir_forward = get_forward_dir(this, parent);
    /*const dir_forward = parent
      ? parent.circle.position.sub(center).normalize()
      : Direction.DIR_X; // TODO: This is temporary*/
    // in P5's y-down coordinates, rotations are clockwise
    const dir_right = Motor.ROT90.transform_dir(dir_forward);
    const dir_left = dir_right.neg();
    const dir_backward = dir_forward.neg();

    // root node puts a vertex at the top to complete the loop
    if (parent === undefined) {
      const root_tip = center.add(dir_forward.scale(this.circle.radius));
      output.push(root_tip);
    }

    // Leaf node puts a vertex to the left, bottom and right
    if (this.children.length === 0) {
      const point_left = center.add(dir_left.scale(radius));
      const point_back = center.add(dir_backward.scale(radius));
      const point_right = center.add(dir_right.scale(radius));

      // Leaf vertices are never skipped
      output.push(point_left, point_back, point_right);
      return;
    }

    // Interior node ------------------------------------

    // Get the direction to each child
    const to_children = this.children.map((child) =>
      child.circle.position.sub(center).normalize(),
    );

    // Point on the left, placed at the half angle between the forward
    // direction and the direction to the child
    const dir_before = halfway(dir_forward, to_children[0], dir_left);
    const before_point = center.add(dir_before.scale(radius));
    if (!this.skip_left) {
      output.push(before_point);
    }

    // Recurse to the first child
    this.children[0].get_outline_vertices(output, this);

    // For additional branches, interleave a vertex between the branches with the recursive calls.
    for (let i = 1; i < this.children.length; i++) {
      const dir_left_child = to_children[i - 1];
      const dir_right_child = to_children[i];
      const dir_between = halfway(
        dir_left_child,
        dir_right_child,
        dir_backward,
      );
      const between_point = center.add(dir_between.scale(radius));

      if (!this.skip_between[i - 1]) {
        output.push(between_point);
      }

      this.children[i].get_outline_vertices(output, this);
    }

    // Point on the right after all the children
    const dir_after = halfway(
      to_children[to_children.length - 1],
      dir_forward,
      dir_right,
    );
    const after_point = center.add(dir_after.scale(radius));

    if (!this.skip_right) {
      output.push(after_point);
    }
  }

  /**
   * Gather up all nodes into an array
   * @param {CoralNode[]} nodes The output node list
   */
  get_all_nodes(nodes) {
    nodes.push(this);

    for (const child of this.children) {
      child.get_all_nodes(nodes);
    }
  }
}

export class CoralTree {
  /**
   * Constructor
   * @param {CoralNode} root Root node of tree
   */
  constructor(root) {
    this.root = root;
  }

  /**
   * @returns {Point[]}
   */
  get_outline_vertices() {
    const vertices = [];
    this.root.get_outline_vertices(vertices);
    return vertices;
  }

  /**
   * Render the tree as an intricate beziergon
   * @returns {BeziergonPrimitive}
   */
  render() {
    return BeziergonPrimitive.interpolate_points(this.get_outline_vertices());
  }

  /**
   *
   * @returns {GroupPrimitive}
   */
  debug_render() {
    const nodes = [];
    this.root.get_all_nodes(nodes);
    const circle_prims = nodes.map((node) => node.circle);

    const vertex_prims = this.get_outline_vertices();
    return group(...circle_prims, ...vertex_prims);
  }
}
