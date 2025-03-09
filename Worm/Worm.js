import { Point } from "../pga2d/objects.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";
import {
  BeziergonPrimitive,
  CirclePrimitive,
  GroupPrimitive,
  LinePrimitive,
  PointPrimitive,
} from "../sketchlib/primitives.js";
import { Style } from "../sketchlib/Style.js";
import { Color } from "../sketchlib/Style.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";
import { Motor } from "../pga2d/versors.js";
import { AnimationChain, Joint } from "./AnimationChain.js";
import { is_nearly } from "../sketchlib/is_nearly.js";
import { GooglyEye } from "./GooglyEye.js";

const MIN_BEND_ANGLE = (3 * Math.PI) / 4;
const ROT90 = Motor.rotation(Point.ORIGIN, Math.PI / 2);
const ROT45 = Motor.rotation(Point.ORIGIN, Math.PI / 4);
const SHOW_SPINE = false;

const COLOR_SPINE = new Color(255, 255, 255);
const SPINE_STYLE = new Style().with_stroke(COLOR_SPINE);
const CENTER_STYLE = new Style().with_fill(COLOR_SPINE);
const WORM_STYLE = new Style()
  .with_fill(new Color(255, 122, 151))
  .with_stroke(new Color(127, 61, 76));

const WORM_SEGMENTS = 60;
const WORM_SEGMENT_SEPARATION = 30;
// speed in pixels per frame
const WORM_MAX_SPEED = 10;
const WORM_THICKNESS = 20;
const WORM_EYE_RADIUS = 0.25 * WORM_THICKNESS;
const WORM_PUPIL_RADIUS = (3 / 16) * WORM_THICKNESS;
const WORM_EYE_SEPARATION = 0.5 * WORM_THICKNESS;
const WORM_NOSE_RADIUS = 1.25 * WORM_THICKNESS;
const INITIAL_POSITION = Point.point(WIDTH / 2, HEIGHT - 2 * WORM_THICKNESS);

class Worm {
  constructor() {
    const first_point = INITIAL_POSITION;
    const down = Point.direction(0, WORM_SEGMENT_SEPARATION);

    const joints = new Array(WORM_SEGMENTS);
    for (let i = 0; i < WORM_SEGMENTS; i++) {
      const position = first_point.add(down.scale(i));

      let follow_distance = WORM_SEGMENT_SEPARATION;
      if (i === 0) {
        follow_distance = 0;
      } else if (i === 1) {
        follow_distance = WORM_NOSE_RADIUS;
      }
      joints[i] = new Joint(position, follow_distance);
    }

    this.chain = new AnimationChain(joints, MIN_BEND_ANGLE);

    this.look_direction = Point.direction(0, 1);
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

  get head() {
    return this.chain.head;
  }

  get tail() {
    return this.chain.tail;
  }

  /**
   * Move the head towards the given point.
   * @param {Point} point The point to move the head towards
   */
  move_head_towards(point) {
    const head_position = this.head.position;

    const to_point = point.sub(head_position);

    const velocity = to_point.limit_length(WORM_MAX_SPEED);
    if (is_nearly(velocity.ideal_norm_sqr(), 0)) {
      return;
    }

    this.look_direction = velocity.normalize();
    const target = head_position.add(velocity);
    this.chain.move(target);
  }

  render_spine() {
    const lines = new Array(this.chain.length - 1);
    const positions = this.chain.get_positions();
    for (let i = 0; i < lines.length; i++) {
      lines[i] = new LinePrimitive(positions[i], positions[i + 1]);
    }
    const spine_group = new GroupPrimitive(lines, SPINE_STYLE);

    const centers = positions.map((x) => new PointPrimitive(x));
    const centers_group = new GroupPrimitive(centers, CENTER_STYLE);

    return new GroupPrimitive([spine_group, centers_group]);
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

    return new GroupPrimitive([beziergon], WORM_STYLE);
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
    return new GroupPrimitive([left.render(), right.render()]);
  }

  render() {
    // Who said worms can't be vertibrates?
    const spine = this.render_spine();
    const body = this.render_body();
    const eyes = this.render_eyes();
    if (SHOW_SPINE) {
      return new GroupPrimitive([body, spine, eyes]);
    } else {
      return new GroupPrimitive([body, eyes]);
    }
  }
}

const WORM = new Worm();

export const sketch = (p) => {
  let canvas;
  let mouse = INITIAL_POSITION;
  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;
  };

  p.draw = () => {
    p.background(0);

    WORM.move_head_towards(mouse);

    draw_primitive(p, WORM.render());
  };

  p.mouseMoved = () => {
    mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
  };

  p.mouseDragged = p.mouseMoved;
};
