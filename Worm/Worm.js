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

const MIN_ANGLE = (2 * Math.PI) / 3;
const MIN_DOT_PRODUCT = Math.cos(MIN_ANGLE);
const ROT90 = Motor.rotation(Point.ZERO, Math.PI / 2);
const ROT45 = Motor.rotation(Point.ZERO, Math.PI / 4);

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
      this.position = Motor.rotation(b, -MIN_ANGLE).transform(a);
    } else {
      this.position = Motor.rotation(b, MIN_ANGLE).transform(a);
    }
  }
}

const COLOR_SPINE = new Color(255, 255, 255);
const SPINE_STYLE = new Style().with_stroke(COLOR_SPINE);
const CENTER_STYLE = new Style().with_fill(COLOR_SPINE);
const WORM_STYLE = new Style()
  .with_fill(new Color(255, 122, 151))
  .with_stroke(new Color(255, 0, 0));

const WORM_SEGMENTS = 100;
const WORM_SEGMENT_SEPARATION = 20;
// speed in pixels per frame
const WORM_MAX_SPEED = 10;
const WORM_THICKNESS = 30;
class Worm {
  constructor() {
    const first_point = Point.point(WIDTH / 2, HEIGHT / 2);
    const down = Point.direction(0, WORM_SEGMENT_SEPARATION);
    this.segments = new Array(WORM_SEGMENTS);
    for (let i = 0; i < WORM_SEGMENTS; i++) {
      const position = first_point.add(down.scale(i));
      this.segments[i] = new BodySegment(position, WORM_SEGMENT_SEPARATION);
    }
  }

  get head() {
    return this.segments[0];
  }

  get tail() {
    return this.segments[this.segments.length - 1];
  }

  move_head_towards(point) {
    const velocity = point.sub(this.head.position).limit_length(WORM_MAX_SPEED);

    this.head.position = this.head.position.add(velocity);
    for (let i = 1; i < this.segments.length; i++) {
      const prev_segment = this.segments[i - 1];
      const curr_segment = this.segments[i];

      if (i >= 2) {
        const prev_prev_segment = this.segments[i - 2];
        curr_segment.follow_bend(prev_segment, prev_prev_segment);
      } else {
        curr_segment.follow(prev_segment);
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

  render_body() {
    const circles = new Array(this.segments.length);
    const left_points = new Array(this.segments.length);
    const right_points = new Array(this.segments.length);
    for (const [i, segment] of this.segments.entries()) {
      circles[i] = new CirclePrimitive(segment.position, WORM_THICKNESS);

      const forward_direction =
        i == 0
          ? segment.position.sub(this.segments[1].position)
          : this.segments[i - 1].position.sub(segment.position);
      const forward_vec = forward_direction.dual().as_vec();

      const left_dir = ROT90.transform_multivec(forward_vec).normalize();
      const right_dir = left_dir.neg();

      const center_vec = segment.position.to_displacement();
      const left_point = center_vec.add(left_dir.scale(WORM_THICKNESS));
      const right_point = center_vec.add(right_dir.scale(WORM_THICKNESS));

      left_points[i] = Point.from_displacement(left_point);
      right_points[i] = Point.from_displacement(right_point);
    }

    const head = this.head;
    const heading = head.position
      .sub(this.segments[1].position)
      .to_displacement()
      .normalize();

    const head_vec = head.position.to_displacement();

    const left_45 = ROT45.transform_multivec(heading);
    const right_45 = ROT45.reverse().transform_multivec(heading);

    const head_point = head_vec.add(heading.scale(WORM_THICKNESS));
    const head_left = head_vec.add(left_45.scale(WORM_THICKNESS));
    const head_right = head_vec.add(right_45.scale(WORM_THICKNESS));

    const tail = this.tail;
    // It's a pun :P
    const tailing = tail.position
      .sub(this.segments[this.segments.length - 2].position)
      .to_displacement();

    const tail_point = tail.position
      .to_displacement()
      .add(tailing.scale(WORM_THICKNESS));

    right_points.reverse();
    const all_points = left_points.concat(
      Point.from_displacement(tail_point),
      right_points,
      Point.from_displacement(head_right),
      Point.from_displacement(head_point),
      Point.from_displacement(head_left)
    );
    const beziergon = BeziergonPrimitive.interpolate_points(all_points);

    //const debug = new PointPrimitive(all_points[all_points.length - 1]);
    return new GroupPrimitive([beziergon /*debug*/], WORM_STYLE);
  }

  render() {
    // Who said worms can't be vertibrates?
    const spine = this.render_spine();
    const body = this.render_body();
    return new GroupPrimitive([body, spine]);
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
