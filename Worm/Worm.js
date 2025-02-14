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
}

const COLOR_SPINE = new Color(255, 255, 255);
const SPINE_STYLE = new Style().with_stroke(COLOR_SPINE);
const CENTER_STYLE = new Style().with_fill(COLOR_SPINE);

const WORM_SEGMENTS = 10;
const WORM_SEGMENT_SEPARATION = 25;
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

  move_towards(point) {
    const to_point = point.sub(this.head.position);
    console.log(to_point);
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
  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;
  };

  p.draw = () => {
    p.background(0);

    draw_primitive(p, WORM.render());
  };

  p.mouseMove = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    WORM.move_towards(mouse);
  };
};
