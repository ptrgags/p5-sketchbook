import { in_bounds } from "../common/in_bounds.js";
import { Line, Point } from "../pga2d/objects.js";

const WIDTH = 500;
const HEIGHT = 700;

const VANISHING_POINT = Point.point(WIDTH / 2, HEIGHT / 2);

const HORIZON = VANISHING_POINT.join(Point.DIR_X);

const POINT_DIAMETER = 8;
function draw_point(p, point) {
  p.circle(point.x, HEIGHT - point.y, POINT_DIAMETER);
}

const RIGHT_SIDE = new Line(1, 0, WIDTH);
const TOP_SIDE = new Line(0, 1, HEIGHT);
const LEFT_SIDE = Line.Y_AXIS;
const BOTTOM_SIDE = Line.X_AXIS;

function draw_line(p, line) {
  const isx_right = line.meet(RIGHT_SIDE);
  const isx_top = line.meet(TOP_SIDE);
  const isx_left = line.meet(LEFT_SIDE);
  const isx_bottom = line.meet(BOTTOM_SIDE);
  const intersections = [isx_right, isx_top, isx_left, isx_bottom].filter(
    (isx) => {
      !isx.is_direction && in_bounds(isx.x, isx.y, WIDTH, HEIGHT);
    }
  );

  if (intersections.length !== 2) {
    console.log("line not visible!");
    return;
  }

  const [a, b] = intersections;
  p.line(a.x, HEIGHT - a.y, b.x, HEIGHT - b.y);
}

export const sketch = (p) => {
  let canvas;
  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;

    p.background(127);

    p.noFill();
    draw_point(p, VANISHING_POINT);
    draw_line(p, HORIZON);
  };
};
