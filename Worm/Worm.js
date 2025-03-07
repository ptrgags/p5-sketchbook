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
import { Joint } from "./AnimationChain.js";
import { is_nearly } from "../sketchlib/is_nearly.js";
import { GooglyEye } from "./GooglyEye.js";

const MIN_ANGLE = (2 * Math.PI) / 3;
const MIN_DOT_PRODUCT = Math.cos(MIN_ANGLE);
const ROT90 = Motor.rotation(Point.ORIGIN, Math.PI / 2);
const ROT45 = Motor.rotation(Point.ORIGIN, Math.PI / 4);
const ROT15 = Motor.rotation(Point.ORIGIN, Math.PI / 12);
const SHOW_SPINE = false;

class BodySegment {
  constructor(initial_position, follow_distance) {
    this.position = initial_position;
    this.follow_distance = follow_distance;
  }

  follow(segment) {
    // Get a direction from the segment we're following to us, but limit it
    // to the follow distance
    const separation = this.position
      .sub(segment.position)
      .limit_length(this.follow_distance);

    this.position = segment.position.add(separation);
  }

  follow_bend(prev_segment, prev_prev_segment) {
    // Three points around the bend
    const a = prev_prev_segment.position;
    const b = prev_segment.position;
    const c = this.position;

    // Get lines oriented away from the center point
    const ba = b.join(a);
    const bc = b.join(c);
    const is_ccw = bc.sin_angle_to(ba) > 0;
    const dot_product = bc.dot(ba);

    if (dot_product < MIN_DOT_PRODUCT) {
      // The bend angle is not too sharp, so follow behind as usual
      this.follow(prev_segment);
      return;
    } else if (is_ccw) {
      this.position = Motor.rotation(b, -MIN_ANGLE).transform_point(a);
    } else {
      this.position = Motor.rotation(b, MIN_ANGLE).transform_point(a);
    }
  }
}

const COLOR_SPINE = new Color(255, 255, 255);
const SPINE_STYLE = new Style().with_stroke(COLOR_SPINE);
const CENTER_STYLE = new Style().with_fill(COLOR_SPINE);
const WORM_STYLE = new Style()
  .with_fill(new Color(255, 122, 151))
  .with_stroke(new Color(127, 61, 76));

const WORM_SEGMENTS = 100;
const WORM_SEGMENT_SEPARATION = 20;
// speed in pixels per frame
const WORM_MAX_SPEED = 10;
const WORM_THICKNESS = 30;

const WORM_EYE_RADIUS = 0.25 * WORM_THICKNESS;
const WORM_PUPIL_RADIUS = (3 / 16) * WORM_THICKNESS;
const WORM_EYE_SEPARATION = 0.5 * WORM_THICKNESS;
class Worm {
  constructor() {
    const first_point = Point.point(WIDTH / 2, HEIGHT / 2);
    const down = Point.direction(0, WORM_SEGMENT_SEPARATION);

    /**
     * @type {Joint[]}
     */
    this.segments = new Array(WORM_SEGMENTS);
    for (let i = 0; i < WORM_SEGMENTS; i++) {
      const position = first_point.add(down.scale(i));
      this.segments[i] = new Joint(position, WORM_SEGMENT_SEPARATION);
    }

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
    return this.segments[0];
  }

  get tail() {
    return this.segments[this.segments.length - 1];
  }

  /**
   * @param {Point} point The point to move the head towards
   */
  move_head_towards(point) {
    const velocity = point.sub(this.head.position).limit_length(WORM_MAX_SPEED);
    if (!is_nearly(velocity.ideal_norm_sqr(), 0)) {
      this.look_direction = velocity.normalize();
    }

    this.head.position = this.head.position.add(velocity);

    for (let i = 1; i < this.segments.length; i++) {
      const prev_segment = this.segments[i - 1];
      const curr_segment = this.segments[i];

      if (/*i >= 2*/ false) {
        const prev_prev_segment = this.segments[i - 2];
        curr_segment.follow_bend(prev_segment, prev_prev_segment, MIN_ANGLE);
      } else {
        curr_segment.follow(prev_segment.position);
      }
    }
  }

  render_spine() {
    const lines = new Array(this.segments.length - 1);
    for (let i = 0; i < lines.length; i++) {
      lines[i] = new LinePrimitive(
        this.segments[i].position,
        this.segments[i + 1].position
      );
    }
    const spine_group = new GroupPrimitive(lines, SPINE_STYLE);

    const centers = this.segments.map((x) => new PointPrimitive(x.position));
    const centers_group = new GroupPrimitive(centers, CENTER_STYLE);

    return new GroupPrimitive([spine_group, centers_group]);
  }

  compute_circles() {
    const circles = new Array(this.segments.length);
    for (const [i, segment] of this.segments.entries()) {
      circles[i] = new CirclePrimitive(segment.position, WORM_THICKNESS);
    }

    return circles;
  }

  compute_side_points() {
    const left_points = new Array(this.segments.length);
    const right_points = new Array(this.segments.length);
    for (const [i, segment] of this.segments.entries()) {
      const center = segment.position;
      const forward_direction =
        i == 0
          ? center.sub(this.segments[1].position)
          : this.segments[i - 1].position.sub(center);

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
    const head = this.head.position;
    const heading = head.sub(this.segments[1].position).normalize();

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
    const tailing = tail
      .sub(this.segments[this.segments.length - 2].position)
      .normalize();

    const left_15 = ROT15.transform_point(tailing);
    const right_15 = ROT15.reverse().transform_point(tailing);

    const tail_point = tail.add(tailing.scale(2 * WORM_THICKNESS));
    const tail_left = tail.add(left_15.scale(WORM_THICKNESS));
    const tail_right = tail.add(right_15.scale(WORM_THICKNESS));

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

    const center = this.head.position;
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
  let mouse = Point.point(WIDTH / 2, HEIGHT / 2);
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
};
