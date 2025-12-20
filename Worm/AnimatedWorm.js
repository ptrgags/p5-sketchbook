import { Point } from "../pga2d/objects.js";
import { Style } from "../sketchlib/Style.js";
import { Color } from "../sketchlib/Color.js";
import { Motor } from "../pga2d/versors.js";
import { AnimationChain, Joint } from "../sketchlib/AnimationChain.js";
import { is_nearly } from "../sketchlib/is_nearly.js";
import { GooglyEye } from "./GooglyEye.js";
import { BeziergonPrimitive } from "../sketchlib/primitives/BeziergonPrimitive.js";
import { CirclePrimitive } from "../sketchlib/primitives/CirclePrimitive.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { PointPrimitive } from "../sketchlib/primitives/PointPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";

const WORM_SEGMENTS = 60;
const WORM_SEGMENT_SEPARATION = 30;
// speed in pixels per frame
const WORM_MAX_SPEED = 10;
const WORM_THICKNESS = 20;
const WORM_EYE_RADIUS = 0.25 * WORM_THICKNESS;
const WORM_PUPIL_RADIUS = (3 / 16) * WORM_THICKNESS;
const WORM_EYE_SEPARATION = 0.5 * WORM_THICKNESS;
const WORM_NOSE_RADIUS = 1.25 * WORM_THICKNESS;
const WORM_MIN_BEND_ANGLE = (3 * Math.PI) / 4;

const ROT90 = Motor.rotation(Point.ORIGIN, Math.PI / 2);
const ROT45 = Motor.rotation(Point.ORIGIN, Math.PI / 4);
const DEBUG_SHOW_SPINE = false;

const SPINE_STYLE = new Style({ stroke: Color.WHITE });
const CENTER_STYLE = new Style({ fill: Color.WHITE });
const WORM_STYLE = new Style({
  fill: new Color(255, 122, 151),
  stroke: new Color(127, 61, 76),
});

/**
 * A cute animated worm with googly eyes, animated with AnimationChain
 */
export class AnimatedWorm {
  /**
   * Create a worm, starting at the initial position
   * @param {Point} initial_position The initial position for the nose
   */
  constructor(initial_position) {
    const first_point = initial_position;
    const down = new Direction(0, WORM_SEGMENT_SEPARATION);

    const joints = new Array(WORM_SEGMENTS);
    for (let i = 0; i < WORM_SEGMENTS; i++) {
      const position = first_point.add(down.scale(i));

      let follow_distance = WORM_SEGMENT_SEPARATION;
      if (i === 0) {
        // The first joint is the nose of the worm, this is what will
        // actually be following the mouse
        follow_distance = 0;
      } else if (i === 1) {
        // The second joint is the center of the head. It follows the nose,
        // but this distance is a little longer than the separation between
        // joints.
        follow_distance = WORM_NOSE_RADIUS;
      }
      joints[i] = new Joint(position, follow_distance);
    }

    this.chain = new AnimationChain(joints, WORM_MIN_BEND_ANGLE);

    this.look_direction = new Direction(0, 1);
    this.googly = [
      new GooglyEye(
        first_point.add(Point.DIR_X.scale(-WORM_EYE_SEPARATION)),
        this.look_direction,
        WORM_EYE_RADIUS,
        WORM_PUPIL_RADIUS
      ),
      new GooglyEye(
        first_point.add(Point.DIR_X.scale(WORM_EYE_SEPARATION)),
        this.look_direction,
        WORM_EYE_RADIUS,
        WORM_PUPIL_RADIUS
      ),
    ];
  }

  get nose() {
    return this.chain.head;
  }

  get head() {
    return this.chain.get_joint(1);
  }

  get tail() {
    return this.chain.tail;
  }

  /**
   * Move the worm's nose towards the given point
   * @param {Point} point The point to move the head towards
   */
  move_nose_towards(point) {
    const nose_position = this.nose.position;
    const to_point = point.sub(nose_position);

    const velocity = to_point.limit_length(WORM_MAX_SPEED);
    if (is_nearly(velocity.ideal_norm_sqr(), 0)) {
      return;
    }

    this.look_direction = velocity.normalize();
    const target = nose_position.add(velocity);
    this.chain.move(target);
  }

  render_spine() {
    const lines = new Array(this.chain.length - 1);
    const positions = this.chain.get_positions();
    for (let i = 0; i < lines.length; i++) {
      lines[i] = new LinePrimitive(positions[i], positions[i + 1]);
    }
    const spine_group = style(lines, SPINE_STYLE);

    const centers = positions.map((x) => new PointPrimitive(x));
    const centers_group = style(centers, CENTER_STYLE);

    return group(spine_group, centers_group);
  }

  compute_circles() {
    const positions = this.chain.get_positions();
    const circles = new Array(positions.length);
    for (const [i, center] of positions.entries()) {
      circles[i] = new CirclePrimitive(center, WORM_THICKNESS);
    }

    return circles;
  }

  compute_side_points() {
    // Ignore the first joint (nose), that will be handled in compute_head_points
    const positions = this.chain.get_positions().slice(1);
    const left_points = new Array(positions.length);
    const right_points = new Array(positions.length);
    for (const [i, center] of positions.entries()) {
      const forward_direction =
        i == 0 ? center.sub(positions[1]) : positions[i - 1].sub(center);

      const left_dir = ROT90.transform_point(forward_direction).normalize();
      const right_dir = left_dir.neg();

      left_points[i] = center.add(left_dir.scale(WORM_THICKNESS));
      right_points[i] = center.add(right_dir.scale(WORM_THICKNESS));
    }

    right_points.reverse();

    return {
      left: left_points,
      right: right_points,
    };
  }

  compute_head_points() {
    const head = this.chain.get_joint(1).position;
    const heading = head.sub(this.chain.get_joint(2).position).normalize();

    const left_45 = ROT45.transform_point(heading);
    const right_45 = ROT45.reverse().transform_point(heading);

    const head_point = head.add(heading.scale(1.5 * WORM_THICKNESS));
    const head_left = head.add(left_45.scale(WORM_THICKNESS));
    const head_right = head.add(right_45.scale(WORM_THICKNESS));

    return [head_right, head_point, head_left];
  }

  compute_tail_points() {
    const tail = this.tail.position;
    // It's a pun on "heading" :P
    const tailing = tail.sub(this.chain.get_joint(-2).position).normalize();

    const left_45 = ROT45.transform_point(tailing);
    const right_45 = ROT45.reverse().transform_point(tailing);

    const tail_point = tail.add(tailing.scale(WORM_THICKNESS));
    const tail_left = tail.add(left_45.scale(WORM_THICKNESS));
    const tail_right = tail.add(right_45.scale(WORM_THICKNESS));

    return [tail_right, tail_point, tail_left];
  }

  render_body() {
    const head_points = this.compute_head_points();
    const tail_points = this.compute_tail_points();

    const { left, right } = this.compute_side_points();
    const all_points = left.concat(tail_points, right, head_points);
    const beziergon = BeziergonPrimitive.interpolate_points(all_points);

    return style(beziergon, WORM_STYLE);
  }

  render_eyes() {
    const [left, right] = this.googly;

    const center = this.chain.get_joint(1).position;
    const left_dir = ROT90.transform_point(this.look_direction);
    const right_dir = ROT90.reverse().transform_point(this.look_direction);

    const left_position = center.add(left_dir.scale(WORM_EYE_SEPARATION));
    const right_position = center.add(right_dir.scale(WORM_EYE_SEPARATION));
    left.update(left_position, this.look_direction);
    right.update(right_position, this.look_direction);
    return group(left.render(), right.render());
  }

  render() {
    // Who said worms can't be vertibrates?
    const spine = this.render_spine();
    const body = this.render_body();
    const eyes = this.render_eyes();
    if (DEBUG_SHOW_SPINE) {
      return group(body, spine, eyes);
    } else {
      return group(body, eyes);
    }
  }
}
