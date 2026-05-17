import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";

/**
 * Compute a circle with the following properties:
 *
 * - its center is on the x-axis
 * - the circle is orthogonal to the unit circle
 * - the circle intersects the line for the diagonal mirror (see reflection_group() below), making an angle pi/q
 * @param {number} p
 * @param {number} q
 * @returns {Circle}
 */
function compute_edge_circle(p, q) {
  const angle_p = Math.PI / p;
  const angle_q = Math.PI / q;

  // TODO: how did I derive this again?
  // center = cos(pi/q) * k
  // radius = sin(pi/p) * K
  // where K = 1/sqrt(cos^2(pi/q) - sin^2(pi/2))

  const cos_q = Math.cos(angle_q);
  const sin_p = Math.sin(angle_p);
  const k = 1 / Math.sqrt(cos_q * cos_q - sin_p * sin_p);
  const center = cos_q * k;
  const radius = sin_p * k;

  return new Circle(new Point(center, 0), radius);
}

export function compute_geometry(p, q) {
  const circle = compute_edge_circle(p, q);
  const center = Point.ORIGIN;
  const edge_center = new Point(circle.center.x - circle.radius, 0);

  // angle to vertex is pi/2 - pi/p - pi/q = pi(1/2 - 1/p - 1/q)
  // supplimentary angle is pi - angle_to_vertex:
  // pi - pi(1/2 - 1/p - 1/q)
  // pi(1 - 1/2 + 1/p + 1/q)
  // pi(1/2 + 1/p + 1/q)
  const angle_to_vertex = Math.PI * (1 / 2 + 1 / p + 1 / q);
  const vertex = circle.center.add(
    Direction.from_angle(angle_to_vertex).scale(circle.radius),
  );

  const horizontal_edge = ClineArc.from_segment(
    new LineSegment(center, edge_center),
  );
  const arc_edge = ClineArc.from_arc(
    new ArcPrimitive(
      circle.center,
      circle.radius,
      new ArcAngles(Math.PI, angle_to_vertex),
    ),
  );
  const diagonal_edge = ClineArc.from_segment(new LineSegment(vertex, center));

  const tile_edge = ClineArc.from_arc(
    new ArcPrimitive(
      circle.center,
      circle.radius,
      new ArcAngles(angle_to_vertex, 2 * Math.PI - angle_to_vertex),
    ),
  );

  return {
    circle: Cline.from_circle(circle),
    vertices: [center, edge_center, vertex].map(NullPoint.from_point),
    edges: [horizontal_edge, arc_edge, diagonal_edge],
    tile_edge,
  };
}

/**
 *
 * @param {number} p How many sides does the centeral (hyperbolic) polygon have?
 * @param {number} q How many polygons meet at each vertex?
 * @returns
 */
export function make_tiling(p, q) {
  if (p < 3) {
    throw new Error("p must be at least 3");
  }

  if (q < 3) {
    throw new Error("q must be at least 3");
  }

  if ((p - 2) * (q - 2) <= 4) {
    throw new Error(
      "to make a hyperbolic tiling, (p - 2)(q - 2) must be greater than 4",
    );
  }

  // first transformation is flipping over the x-axis
  const flip_y = CVersor.FLIP_Y;
  const rotate_center = CVersor.rotation((2 * Math.PI) / p);
  const diagonal_mirror = rotate_center.compose(flip_y);

  // compute the circle for the arc that marks the boundary of the tile,
  // and turn it into a circle inversion
  const circle = compute_edge_circle(p, q);
  const circle_inversion = CVersor.to_screen(circle).conjugate(
    CVersor.INVERSION,
  );

  const arc_elliptic = circle_inversion.compose(flip_y);
  const vertex_elliptic = arc_elliptic.compose(rotate_center.inv());

  const groups = {
    reflection_group: {
      flip_y,
      diagonal_mirror,
      circle_inversion,
    },
    corner_rotation_group: {
      rotate_center,
      arc_elliptic,
      vertex_elliptic,
    },
  };

  // Some subgroups require the angle divisor to be even
  if (q % 2 === 0) {
    groups.center_edge_group = { rotate_center, arc_elliptic };
  }

  if (p % 2 === 0) {
    groups.bisector_vertex_group = { vertex_elliptic, flip_y };
  }

  return groups;
}

/**
 * @enum {number}
 */
export const TileType = {
  EDGE: 0,
  VERTEX: 1,
};
