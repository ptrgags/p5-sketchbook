import { Point } from "../pga2d/objects.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";
import {
  GroupPrimitive,
  LinePrimitive,
  PointPrimitive,
} from "../sketchlib/primitives.js";
import { Style } from "../sketchlib/Style.js";
import { Color } from "../sketchlib/Style.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";

class BodySegment {
  constructor(initial_position, follow_distance) {
    this.position = initial_position;
    this.follow_distance = follow_distance;
  }

  follow(segment) {
    // Get a vector from the segment we're following to us, but limit it
    // to the follow distance
    const separation = this.position
      .sub(segment.position)
      .limit_length(this.follow_distance);

    this.position = segment.position.add(separation);
  }
}

const COLOR_SPINE = new Color(255, 255, 255);
const SPINE_STYLE = new Style().with_stroke(COLOR_SPINE);
const CENTER_STYLE = new Style().with_fill(COLOR_SPINE);

const WORM_SEGMENTS = 10;
const WORM_SEGMENT_SEPARATION = 25;
// speed in pixels per frame
const WORM_MAX_SPEED = 2;
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

  move_tail_towards(point) {
    const velocity = point.sub(this.tail.position).limit_length(WORM_MAX_SPEED);

    this.tail.position = this.tail.position.add(velocity);
    for (let i = 0; i < this.segments.length - 1; i++) {
      const current_segment = this.segments[this.segments.length - 2 - i];
      const prev_segment = this.segments[this.segments.length - 1 - i];
      current_segment.follow(prev_segment);
    }
  }

  move_head_towards(point) {
    const velocity = point.sub(this.head.position).limit_length(WORM_MAX_SPEED);

    this.head.position = this.head.position.add(velocity);
    for (let i = 1; i < this.segments.length; i++) {
      this.segments[i].follow(this.segments[i - 1]);
    }
  }

  render() {
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
