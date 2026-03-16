// based on https://github.com/ptrgags/math-notebook/blob/main/mobius/src/hyperbolic_tilings.rs
// which in turn was based on "Creating repeating hyperbolic patterns" bu Dunham, Lindgren, and Witte (https://dl.acm.org/doi/10.1145/965161.806808)
// though I derived the transformations using mobius maps + reflection
//
// here I'm translating that math to CGA transformations

import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { FractalPrefixAnimation } from "./FractalPrefixAnimation.js";

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

/**
 *
 * @param {number} p How many sides does the centeral (hyperbolic) polygon have?
 * @param {number} q How many polygons meet at each vertex?
 * @returns
 */
function make_tiling(p, q) {
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

const TILING_6_4 = make_tiling(6, 4);

const MOTIF = Cline.from_circle(new Circle(new Point(0.25, 0), 0.1));

// how to animate mirror tilings? can't lerp clines or cline arcs
