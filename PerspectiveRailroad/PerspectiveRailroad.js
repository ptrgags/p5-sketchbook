import { Style } from "../sketchlib/Style.js";
import { Color } from "../sketchlib/Color.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Point } from "../pga2d/Point.js";
import { Line } from "../pga2d/Line.js";
import { Direction } from "../pga2d/Direction.js";

const WIDTH = 500;
const HEIGHT = 700;

// vanishing point of the rails
const VP_RAILS = new Point(WIDTH / 2, HEIGHT / 4);
const A = new Point(WIDTH / 4, HEIGHT);
const B = new Point((3 * WIDTH) / 4, HEIGHT);

const BOTTOM_SIDE = new Line(0, 1, HEIGHT);

const RAIL_WIDTH = 30;
const RAIL_HEIGHT = 50;

const DEFAULT_STYLE = new Style({ stroke: Color.BLACK });
const GROUND_STYLE = DEFAULT_STYLE.with_fill(new Color(135, 201, 162));
const SKY_STYLE = new Style({ fill: new Color(30, 173, 235) });
const RAIL_STYLE = DEFAULT_STYLE.with_fill(new Color(71, 70, 69));
const TIE_STYLE = DEFAULT_STYLE.with_fill(new Color(99, 59, 26));

const CLOSED = true;

function compute_rails() {
  const A_top_left = A.add(Direction.DIR_Y.scale(-RAIL_HEIGHT));
  const A_top_right = A_top_left.add(Direction.DIR_X.scale(RAIL_WIDTH));
  const A_bottom_right = A.add(Direction.DIR_X.scale(RAIL_WIDTH));
  const A_rail_top_left = A_top_left.join(VP_RAILS);
  const A_rail_top_right = A_top_right.join(VP_RAILS);
  const A_rail_bottom_right = A_bottom_right.join(VP_RAILS);
  const isx_A_top_left = A_rail_top_left.meet(BOTTOM_SIDE);
  const isx_A_top_right = A_rail_top_right.meet(BOTTOM_SIDE);
  const isx_A_bottom_right = A_rail_bottom_right.meet(BOTTOM_SIDE);

  const B_bottom_left = B;
  const B_top_left = B.add(Direction.DIR_Y.scale(-RAIL_HEIGHT));
  const B_top_right = B_top_left.add(Direction.DIR_X.scale(RAIL_WIDTH));
  const B_rail_bottom_left = B_bottom_left.join(VP_RAILS);
  const B_rail_top_left = B_top_left.join(VP_RAILS);
  const B_rail_top_right = B_top_right.join(VP_RAILS);
  const isx_B_bottom_left = B_rail_bottom_left.meet(BOTTOM_SIDE);
  const isx_B_top_left = B_rail_top_left.meet(BOTTOM_SIDE);
  const isx_B_top_right = B_rail_top_right.meet(BOTTOM_SIDE);

  // The rails are perspective cuboids, but on the screen they look like
  // elongated triangles
  const left_rail_top = new PolygonPrimitive(
    [isx_A_top_left, isx_A_top_right, VP_RAILS],
    CLOSED
  );
  const left_rail_side = new PolygonPrimitive(
    [isx_A_top_right, isx_A_bottom_right, VP_RAILS],
    CLOSED
  );
  const right_rail_side = new PolygonPrimitive(
    [isx_B_bottom_left, isx_B_top_left, VP_RAILS],
    CLOSED
  );
  const right_rail_top = new PolygonPrimitive(
    [isx_B_top_left, isx_B_top_right, VP_RAILS],
    CLOSED
  );

  return [left_rail_top, left_rail_side, right_rail_top, right_rail_side];
}

const MAX_ITERATIONS = 500;

/**
 * Get a number of evenly spaced rectangles along the ground in 1-point
 * perspective. This will look like a sidwalk.
 * @param {Point} point_a The bottom left corner of the sidewalk
 * @param {Point} point_b The bottom right corner of the sidewalk. It must be at the same y-value as point_a.
 * @param {Point} vp Vanishing point where rectangles converge
 * @param {number} vertical_spacing vertical spacing in px between the first two lines.
 * @returns {object} An object with data representing the lines and points of the pattern.
 */
function even_spaced_rectangles(point_a, point_b, vp, vertical_spacing) {
  // the two points determine the bottom line,
  // the second line is the given number of pixels above it.
  const first_line = point_a.join(point_b);
  const second_line = point_a
    .add(Direction.DIR_Y.scale(-vertical_spacing))
    .join(Direction.DIR_X);

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
    const next_line = next_right.join(Direction.DIR_X);
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
    const tie_top = isx.join(Direction.DIR_X);
    const top_left = tie_top.meet(guide_left);
    const top_right = tie_top.meet(guide_right);

    ties.push(
      new PolygonPrimitive([quad_a, quad_b, top_right, top_left], CLOSED)
    );
  }

  return ties;
}

function make_background() {
  const sky_prim = new RectPrimitive(
    new Point(0, 0),
    new Direction(WIDTH, VP_RAILS.y)
  );
  const sky = style(sky_prim, SKY_STYLE);

  const ground_prim = new RectPrimitive(
    new Point(0, VP_RAILS.y),
    new Direction(WIDTH, HEIGHT - VP_RAILS.y)
  );
  const ground = style(ground_prim, GROUND_STYLE);

  return group(sky, ground);
}

class AnimatedTie {
  constructor(quad, start_frame, duration_frames) {
    if (quad.vertices.length != 4) {
      throw new Error("quad must have exactly 4 vertices");
    }

    this.quad = quad;
    this.start_frame = start_frame;
    this.duration_frames = duration_frames;
  }

  is_finished(frame) {
    return frame >= this.start_frame + this.duration_frames;
  }

  compute_polygon(frame) {
    // We haven't started animating, so don't render anything
    if (frame < this.start_frame) {
      return undefined;
    }

    // We've finished the animation, so just render the full quad
    if (this.is_finished(frame)) {
      return this.quad;
    }

    // In between, expand the tie from the left edge
    const t = (frame - this.start_frame) / this.duration_frames;
    const [a, b, c, d] = this.quad.vertices;
    const bottom_right = Point.lerp(a, b, t);
    const top_right = Point.lerp(d, c, t);

    return new PolygonPrimitive([a, bottom_right, top_right, d], CLOSED);
  }
}

const RAILS_START_FRAME = 20;
const RAILS_DURATION = 200;
const TIE_DURATION = 30;
function make_ties() {
  const tie_bottom_left = new Point(50, HEIGHT);
  const tie_bottom_right = new Point(475, HEIGHT);

  const TIE_SPACING = 100;
  const tie_bottoms = even_spaced_rectangles(
    tie_bottom_left,
    tie_bottom_right,
    VP_RAILS,
    TIE_SPACING
  );
  const tie_prims = railroad_ties(tie_bottoms, 0.5);

  const animated_ties = tie_prims.map((quad, i) => {
    const y = quad.vertices[0].y;
    const t_start = (y - HEIGHT) / (VP_RAILS.y - HEIGHT);
    const start_frame = t_start * RAILS_DURATION;

    return new AnimatedTie(quad, start_frame, TIE_DURATION);
  });
  return animated_ties;
}

class AnimatedRails {
  /**
   * Constructor
   * @param {PolygonPrimitive[]} triangles Perspective triangles that make up parts of the rail
   * @param {number} start_frame First frame of the animation
   * @param {number} duration_frames Duration of the animation in frames
   */
  constructor(triangles, start_frame, duration_frames) {
    triangles.forEach((x) => {
      if (x.vertices.length !== 3) {
        throw new Error("Each rail primitive must be a triangle!");
      }
    });
    this.triangles = triangles;
    this.start_frame = start_frame;
    this.duration_frames = duration_frames;
  }

  is_finished(frame) {
    return frame >= this.start_frame + this.duration_frames;
  }

  compute_polygons(frame) {
    if (frame < this.start_frame) {
      return [];
    }

    if (this.is_finished(frame)) {
      return this.triangles;
    }

    // In between, lerp points towards the vanishing point. This will
    // produce a _quad_ rather than a triangle for the in-between frames.
    const t = (frame - this.start_frame) / this.duration_frames;
    return this.triangles.map((tri) => {
      const [a, b, vp] = tri.vertices;

      const top_left = Point.lerp(a, vp, t);
      const top_right = Point.lerp(b, vp, t);
      return new PolygonPrimitive([a, b, top_right, top_left], CLOSED);
    });
  }
}

function make_rails() {
  const rail_prims = compute_rails();

  return new AnimatedRails(rail_prims, RAILS_START_FRAME, RAILS_DURATION);
}

const BACKGROUND = make_background();
const ANIMATED_TIES = make_ties();
const ANIMATED_RAILS = make_rails();

export const sketch = (p) => {
  let animation_finished = false;
  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);

    BACKGROUND.draw(p);
  };

  p.draw = () => {
    if (animation_finished) {
      return;
    }

    const tie_prims = ANIMATED_TIES.map((x) =>
      x.compute_polygon(p.frameCount)
    ).filter((x) => x !== undefined);
    const ties = style(tie_prims, TIE_STYLE);

    const rail_prims = ANIMATED_RAILS.compute_polygons(p.frameCount);
    const rails = style(rail_prims, RAIL_STYLE);

    const dynamic_geom = group(ties, rails);

    BACKGROUND.draw(p);
    dynamic_geom.draw(p);

    if (
      ANIMATED_RAILS.is_finished(p.frameCount) &&
      ANIMATED_TIES.every((x) => x.is_finished(p.frameCount))
    ) {
      animation_finished = true;
    }
  };
};
