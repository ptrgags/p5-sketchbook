import { in_bounds } from "../common/in_bounds.js";
import { Line, Point } from "../pga2d/objects.js";

const WIDTH = 500;
const HEIGHT = 700;

// vanishing point of the rails
const VP_RAILS = Point.point(WIDTH / 2, HEIGHT / 2);
// Another vanishing point for reference to determine where the ties go
const VP_REFERENCE = Point.point(-WIDTH / 2, HEIGHT / 2);
const HORIZON = VP_RAILS.join(Point.DIR_X);
const A = Point.point(WIDTH / 4, 0);
const B = Point.point((3 * WIDTH) / 4, 0);

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
      return (
        !isx.is_direction && in_bounds(isx.x, isx.y, WIDTH + 1, HEIGHT + 1)
      );
    }
  );

  if (intersections.length !== 2) {
    console.log("line not visible!");
    return;
  }

  const [a, b] = intersections;
  draw_line_segment(p, a, b);
}

function draw_line_segment(p, a, b) {
  p.line(a.x, HEIGHT - a.y, b.x, HEIGHT - b.y);
}

export const sketch = (p) => {
  let canvas;
  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;

    p.background(127);

    p.noFill();
    draw_point(p, VP_RAILS);
    draw_line(p, HORIZON);

    draw_point(p, A);
    draw_point(p, B);

    // Draw the left and right sides of the train tracks
    draw_line_segment(p, A, VP_RAILS);
    draw_line_segment(p, B, VP_RAILS);

    const left = A.join(VP_RAILS);
    const right = B.join(VP_RAILS);

    const C = B.join(VP_REFERENCE).meet(left);
    const D = C.join(Point.DIR_X).meet(right);
    draw_line_segment(p, C, D);
    draw_point(p, C);
    draw_point(p, D);

    const E = D.join(VP_REFERENCE).meet(left);
    const F = E.join(Point.DIR_X).meet(right);
    draw_line_segment(p, E, F);
    draw_point(p, E);
    draw_point(p, F);
  };
};
