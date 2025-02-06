import { in_bounds } from "../common/in_bounds.js";
import { Line, Point } from "../pga2d/objects.js";

const WIDTH = 500;
const HEIGHT = 700;

// vanishing point of the rails
const VP_RAILS = Point.point(WIDTH / 2, HEIGHT / 4);
const A = Point.point(WIDTH / 4, HEIGHT);
const B = Point.point((3 * WIDTH) / 4, HEIGHT);

const BOTTOM_SIDE = new Line(0, 1, HEIGHT);

const RAIL_WIDTH = 30;
const RAIL_HEIGHT = 50;

class RectPrimitive {
  constructor(position, dimensions) {
    this.position = position;
    this.dimensions = dimensions;
  }
}

class LinePrimitive {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }
}

class PolygonPrimitive {
  constructor(points) {
    this.points = points;
  }

  *[Symbol.iterator]() {
    yield* this.points;
  }
}

class GroupPrimitive {
  constructor(primitives, style) {
    this.primitives = primitives;
    this.style = style;
  }

  *[Symbol.iterator]() {
    yield* this.primitives;
  }
}

function compute_rails() {
  const A_top_left = A.add(Point.DIR_Y.scale(-RAIL_HEIGHT));
  const A_top_right = A_top_left.add(Point.DIR_X.scale(RAIL_WIDTH));
  const A_bottom_right = A.add(Point.DIR_X.scale(RAIL_WIDTH));
  const A_rail_top_left = A_top_left.join(VP_RAILS);
  const A_rail_top_right = A_top_right.join(VP_RAILS);
  const A_rail_bottom_right = A_bottom_right.join(VP_RAILS);
  const isx_A_top_left = A_rail_top_left.meet(BOTTOM_SIDE);
  const isx_A_top_right = A_rail_top_right.meet(BOTTOM_SIDE);
  const isx_A_bottom_right = A_rail_bottom_right.meet(BOTTOM_SIDE);

  const B_bottom_left = B;
  const B_top_left = B.add(Point.DIR_Y.scale(-RAIL_HEIGHT));
  const B_top_right = B_top_left.add(Point.DIR_X.scale(RAIL_WIDTH));
  const B_rail_bottom_left = B_bottom_left.join(VP_RAILS);
  const B_rail_top_left = B_top_left.join(VP_RAILS);
  const B_rail_top_right = B_top_right.join(VP_RAILS);
  const isx_B_bottom_left = B_rail_bottom_left.meet(BOTTOM_SIDE);
  const isx_B_top_left = B_rail_top_left.meet(BOTTOM_SIDE);
  const isx_B_top_right = B_rail_top_right.meet(BOTTOM_SIDE);

  // The rails are perspective cuboids, but on the screen they look like
  // elongated triangles
  const left_rail_top = new PolygonPrimitive([
    isx_A_top_left,
    isx_A_top_right,
    VP_RAILS,
  ]);
  const left_rail_side = new PolygonPrimitive([
    isx_A_top_right,
    isx_A_bottom_right,
    VP_RAILS,
  ]);
  const right_rail_side = new PolygonPrimitive([
    isx_B_bottom_left,
    isx_B_top_left,
    VP_RAILS,
  ]);
  const right_rail_top = new PolygonPrimitive([
    isx_B_top_left,
    isx_B_top_right,
    VP_RAILS,
  ]);

  return [left_rail_top, left_rail_side, right_rail_top, right_rail_side];
}

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
    .add(Point.DIR_Y.scale(-vertical_spacing))
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

    ties.push(new PolygonPrimitive([quad_a, quad_b, top_right, top_left]));
  }

  return ties;
}

function draw_rect(p, rect) {
  const { x, y } = rect.position;
  const { x: w, y: h } = rect.dimensions;
  p.rect(x, y, w, h);
}

function draw_line(p, line) {
  const a = line.a;
  const b = line.b;
  p.line(a.x, a.y, b.x, b.y);
}

function draw_polygon(p, polygon) {
  p.beginShape();
  for (const vertex of polygon) {
    p.vertex(vertex.x, vertex.y);
  }
  p.endShape(p.CLOSE);
}

function apply_style(p, style) {
  if (style.stroke) {
    const { r, g, b } = style.stroke;
    p.stroke(r, g, b);
  } else {
    p.noStroke();
  }

  if (style.fill) {
    const { r, g, b } = style.fill;
    p.fill(r, g, b);
  } else {
    p.noFill();
  }

  p.strokeWeight(style.stroke_width);
}

function draw_group(p, group) {
  p.push();
  if (group.style) {
    apply_style(p, group.style);
  }

  for (const child of group) {
    draw_primitive(p, child);
  }

  p.pop();
}

function draw_primitive(p, primitive) {
  if (primitive instanceof GroupPrimitive) {
    draw_group(p, primitive);
  } else if (primitive instanceof RectPrimitive) {
    draw_rect(p, primitive);
  } else if (primitive instanceof LinePrimitive) {
    draw_line(p, primitive);
  } else if (primitive instanceof PolygonPrimitive) {
    draw_polygon(p, primitive);
  }
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

class Style {
  constructor() {
    this.stroke = undefined;
    this.fill = undefined;
    this.stroke_width = 1;
  }

  clone() {
    const result = new Style();
    result.stroke = this.stroke;
    result.fill = this.fill;
    result.stroke_width = this.stroke_width;
    return result;
  }

  with_stroke(stroke) {
    const result = this.clone();
    result.stroke = stroke;
    return result;
  }

  with_fill(fill) {
    const result = this.clone();
    result.fill = fill;
    return result;
  }

  with_width(width) {
    const result = this.clone();
    result.stroke_width = width;
    return result;
  }
}

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT).elt;

    const default_style = new Style().with_stroke(new Color(0, 0, 0));

    const sky_prim = new RectPrimitive(
      Point.point(0, 0),
      Point.direction(WIDTH, VP_RAILS.y)
    );
    const sky_style = default_style.with_fill(new Color(30, 173, 235));
    const sky = new GroupPrimitive([sky_prim], sky_style);

    const ground_prim = new RectPrimitive(
      Point.point(0, VP_RAILS.y),
      Point.direction(WIDTH, HEIGHT - VP_RAILS.y)
    );
    const ground_style = new Style()
      .with_stroke(new Color(0, 0, 0))
      .with_fill(new Color(135, 201, 162));
    const ground = new GroupPrimitive([ground_prim], ground_style);

    const rail_prims = compute_rails();
    const rail_style = default_style.with_fill(new Color(71, 70, 69));
    const rails = new GroupPrimitive(rail_prims, rail_style);

    const tie_bottom_left = Point.point(50, HEIGHT);
    const tie_bottom_right = Point.point(475, HEIGHT);

    const TIE_SPACING = 100;
    const tie_bottoms = even_spaced_rectangles(
      tie_bottom_left,
      tie_bottom_right,
      VP_RAILS,
      TIE_SPACING
    );
    const tie_prims = railroad_ties(tie_bottoms, 0.5);
    const tie_style = default_style.with_fill(new Color(99, 59, 26));
    const ties = new GroupPrimitive(tie_prims, tie_style);

    const primitives = new GroupPrimitive([sky, ground, ties, rails]);

    draw_primitive(p, primitives);
  };
};
