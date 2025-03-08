import { Point } from "../pga2d/objects.js";
import { Motor } from "../pga2d/versors.js";

/**
 * A joint in an AnimationChain
 */
export class Joint {
  /**
   * @param {Point} position The initial position of this joint
   * @param {number} follow_distance How many units to follow behind the target
   */
  constructor(position, follow_distance, min_bend_angle) {
    this.position = position;
    this.follow_distance = follow_distance;
  }

  /**
   * Follow a target point (often the previous joint's position, but it could be another point)
   * @param {Point} target The target to follow
   */
  follow(target) {
    this.position = Joint.constraint_follow(
      target,
      this.position,
      this.follow_distance
    );
  }

  /**
   * Follow a bend in a chain of points. joint_a and joint_b must be computed
   * for this frame before calling this function for the correct position.
   * @param {Joint} joint_a The first point in the chain
   * @param {Joint} joint_b The second point in the chain
   * @param {number} min_bend_angle The minimum bend angle
   */
  follow_bend(joint_a, joint_b, min_bend_angle) {
    this.position = Joint.constraint_follow_bend(
      joint_a.position,
      joint_b.position,
      this.position,
      this.follow_distance,
      min_bend_angle
    );
  }

  /**
   * Compute a new point that's within a given distance. This is written as
   * a standalone function for easier unit testing.
   * @param {Point} target The point we're following
   * @param {Point} current The current point that's following target
   * @param {number} follow_distance How many units to follow behind the target
   * @returns {Point} The new point for
   */
  static constraint_follow(target, current, follow_distance) {
    const separation = current.sub(target).set_length(follow_distance);
    return target.add(separation);
  }

  /**
   * Hava a point follow the chain, but constrain the angle so if it's too
   * steep it gets expanded back outpoint
   * @param {Point} a Previous previous point in the chain
   * @param {Point} b Previous point in the chain
   * @param {Point} c Current point that's following b
   * @param {number} follow_distance How far away c should be from b
   * @param {number} min_bend_angle The (absolute) bend angle must be at least this big.
   * @returns {Point} The new position for point c after applying the constraint
   */
  static constraint_follow_bend(a, b, c, follow_distance, min_bend_angle) {
    // Get lines oriented away from the center point.
    // Note that these are normalized
    const ba = b.join(a);
    const bc = b.join(c);

    // If the bend angle is mostly straight, just do the simpler following
    // behavior
    const dot_product = bc.dot(ba);
    const max_dot_product = Math.cos(min_bend_angle);
    if (dot_product < max_dot_product) {
      return this.constraint_follow(b, c, follow_distance);
    }

    const is_ccw = bc.sin_angle_to(ba) > 0;
    const unbent_angle = is_ccw ? -min_bend_angle : min_bend_angle;
    const forward = a.sub(b).normalize();
    const rotation = Motor.rotation(Point.ORIGIN, unbent_angle);
    const offset = rotation.transform_point(forward).scale(follow_distance);
    return b.add(offset);
  }
}
