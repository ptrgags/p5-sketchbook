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

function draw_outside_walls(p, a, b, walls) {
  const line = a.join(b);
  const intersections = walls.map((wall) => line.meet(wall));
  draw_line_segment(p, a, intersections[0]);
  for (let i = 1; i < intersections.length - 2; i += 2) {
    draw_line_segment(p, intersections[i], intersections[i + 1]);
  }

  draw_line_segment(p, intersections[intersections.length - 1], b);
}

const RAIL_WIDTH = 30;
const RAIL_HEIGHT = 50;

const MAX_ITERATIONS = 500;

/**
 * Get a number of evenly spaced rectangles along the ground in 1-point
 * perspective. This will look like a sidwalk.
 * @param {Point} point_a The bottom left corner of the sidewalk
 * @param {Point} point_b The bottom right corner of the sidewalk. It must be at the same y-value as point_a.
 * @param {Point} vp Vanishing point where rectangles converge
 * @param {number1} vertical_spacing vertical spacing in px between the first two lines.
 * @returns {object} An object with data representing the lines and points of the pattern.
 */
function even_spaced_rectangles(point_a, point_b, vp, vertical_spacing) {
  // the two points determine the bottom line,
  // the second line is the given number of pixels above it.
  const first_line = point_a.join(point_b);
  const second_line = point_a
    .add(Point.DIR_Y.scale(vertical_spacing))
    .join(Point.DIR_X);

  // Left and right guidelines that lead to the vanishing point
  const guide_left = point_a.join(vp);
  const guide_right = point_b.join(vp);

  // Define the first rectangle explicitly, the rest will be computed
  // by perspective construction
  const horizontal_lines = [first_line, second_line];
  const left_endpoints = [point_a, second_line.meet(guide_left)];
  const right_endpoints = [point_b, second_line.meet(guide_right)];

  // Find the center of the rectangle, then draw a line through it and the
  // vanishing point.
  const diag1 = left_endpoints[1].join(point_b);
  const diag2 = right_endpoints[1].join(point_a);
  const center = diag1.meet(diag2);
  const center_line = center.join(vp);

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const prev_left = left_endpoints[left_endpoints.length - 2];
    const current_line = horizontal_lines[horizontal_lines.length - 1];
    const center = current_line.meet(center_line);
    const line_to_next = prev_left.join(center);
    const next_right = line_to_next.meet(guide_right);
    const next_line = next_right.join(Point.DIR_X);
    const next_left = next_line.meet(guide_left);

    horizontal_lines.push(next_line);
    left_endpoints.push(next_left);
    right_endpoints.push(next_right);
  }

  return {
    guide_left,
    guide_right,
    horizontal_lines,
    left_endpoints,
    right_endpoints,
    vanishing_point: vp,
  };
}

function railroad_ties(tie_bottoms, tie_thickness) {
  const ties = [];

  const point_a = tie_bottoms.left_endpoints[0];
  const point_b = tie_bottoms.right_endpoints[1];
  const ref_point = Point.lerp(point_a, point_b, tie_thickness);
  const ref_line = ref_point.join(tie_bottoms.vanishing_point);

  const { guide_left, guide_right } = tie_bottoms;
  const quad_count = tie_bottoms.horizontal_lines.length - 1;
  for (let i = 0; i < quad_count; i++) {
    const quad_a = tie_bottoms.left_endpoints[i];
    const quad_b = tie_bottoms.right_endpoints[i];
    const quad_c = tie_bottoms.right_endpoints[i + 1];

    const diag = quad_a.join(quad_c);
    const isx = diag.meet(ref_line);
    const tie_top = isx.join(Point.DIR_X);
    const top_left = tie_top.meet(guide_left);
    const top_right = tie_top.meet(guide_right);

    ties.push([quad_a, quad_b, top_right, top_left]);
  }

  return ties;
}

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
    const tie_bottom_right = Point.point(475, 0);

    const TIE_SPACING = 100;
    const tie_bottoms = even_spaced_rectangles(
      tie_bottom_left,
      tie_bottom_right,
      VP_RAILS,
      TIE_SPACING
    );
    const ties = railroad_ties(tie_bottoms, 0.5);

    const walls = [
      rail_top_left,
      rail_bottom_right,
      B_rail_bottom_left,
      B_rail_top_right,
    ];

    // debug lines
    for (const [a, b, c, d] of ties) {
      draw_outside_walls(p, a, b, walls);
      draw_line_segment(p, b, c);
      draw_outside_walls(p, d, c, walls);
      draw_line_segment(p, d, a);
    }
  };
};
