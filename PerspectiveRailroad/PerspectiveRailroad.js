import { in_bounds } from "../common/in_bounds.js";
import { Line, Point } from "../pga2d/objects.js";

const WIDTH = 500;
const HEIGHT = 700;

// vanishing point of the rails
const VP_RAILS = Point.point(WIDTH / 2, (3 * HEIGHT) / 4);
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

const RAIL_WIDTH = 30;
const RAIL_HEIGHT = 50;

export const sketch = (p) => {
  let canvas;
  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;

    p.background(127);

    p.noFill();
    draw_point(p, VP_RAILS);
    draw_line(p, HORIZON);

    const A_top_left = A.add(Point.DIR_Y.scale(RAIL_HEIGHT));
    const A_top_right = A_top_left.add(Point.DIR_X.scale(RAIL_WIDTH));
    const A_bottom_right = A.add(Point.DIR_X.scale(RAIL_WIDTH));
    const rail_top_left = A_top_left.join(VP_RAILS);
    const rail_top_right = A_top_right.join(VP_RAILS);
    const rail_bottom_right = A_bottom_right.join(VP_RAILS);
    const isx_top_left = rail_top_left.meet(BOTTOM_SIDE);
    const isx_top_right = rail_top_right.meet(BOTTOM_SIDE);
    const isx_bottom_right = rail_bottom_right.meet(BOTTOM_SIDE);
    draw_line_segment(p, VP_RAILS, isx_top_left);
    draw_line_segment(p, VP_RAILS, isx_top_right);
    draw_line_segment(p, VP_RAILS, isx_bottom_right);

    const B_bottom_left = B;
    const B_top_left = B.add(Point.DIR_Y.scale(RAIL_HEIGHT));
    const B_top_right = B_top_left.add(Point.DIR_X.scale(RAIL_WIDTH));
    const B_rail_bottom_left = B_bottom_left.join(VP_RAILS);
    const B_rail_top_left = B_top_left.join(VP_RAILS);
    const B_rail_top_right = B_top_right.join(VP_RAILS);
    const isx_B_bottom_left = B_rail_bottom_left.meet(BOTTOM_SIDE);
    const isx_B_top_left = B_rail_top_left.meet(BOTTOM_SIDE);
    const isx_B_top_right = B_rail_top_right.meet(BOTTOM_SIDE);
    draw_line_segment(p, VP_RAILS, isx_B_bottom_left);
    draw_line_segment(p, VP_RAILS, isx_B_top_left);
    draw_line_segment(p, VP_RAILS, isx_B_top_right);

    const tie_bottom_left = Point.point(50, 0);
    const first_tie_top = tie_bottom_left
      .add(Point.DIR_Y.scale(30))
      .join(Point.DIR_X);
    const ties_left = tie_bottom_left.join(VP_RAILS);

    const tie_bottom_right = Point.point(475, 0);
    const ties_right = tie_bottom_right.join(VP_RAILS);
    const tie_top_left = ties_left.meet(first_tie_top);
    const tie_top_right = ties_right.meet(first_tie_top);

    const tie_diag1 = tie_top_left.join(tie_bottom_right);
    const tie_diag2 = tie_top_right.join(tie_bottom_left);
    const tie_center = tie_diag1.meet(tie_diag2);
    const rail_center = tie_center.join(VP_RAILS);

    // debug lines
    p.stroke(255, 0, 0);
    draw_line(p, ties_left);
    draw_line(p, first_tie_top);
    draw_line(p, ties_right);
    draw_line(p, tie_diag1);
    draw_line(p, tie_diag2);
    draw_line(p, rail_center);

    p.stroke(0);

    /*
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
    */
  };
};
