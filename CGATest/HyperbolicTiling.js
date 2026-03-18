// based on https://github.com/ptrgags/math-notebook/blob/main/mobius/src/hyperbolic_tilings.rs
// which in turn was based on "Creating repeating hyperbolic patterns" bu Dunham, Lindgren, and Witte (https://dl.acm.org/doi/10.1145/965161.806808)
// though I derived the transformations using mobius maps + reflection
//
// here I'm translating that math to CGA transformations

import { StaticAnimation } from "../sketchlib/animation/Animated.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { StyledNode } from "../sketchlib/cga2d/StyledNode.js";
import { StyledTile } from "../sketchlib/cga2d/StyledTile.js";
import { Color } from "../sketchlib/Color.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";
import { StyleRuns } from "../sketchlib/styling/StyleRuns.js";

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

function compute_geometry(p, q) {
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

const FOLDS_P = 7;
const FOLDS_Q = 3;

const GEOMETRY = compute_geometry(FOLDS_P, FOLDS_Q);
const GENERATORS = make_tiling(FOLDS_P, FOLDS_Q);
const ROTATIONS = GENERATORS.corner_rotation_group;
const REFLECTIONS = GENERATORS.reflection_group;

// R_p = p-fold rotation around the center of the unit circle
// E_2 = 2-fold elliptic around the center of the arc surrounding the tile

const FY = REFLECTIONS.flip_y;
const FD = REFLECTIONS.diagonal_mirror;
const FC = REFLECTIONS.circle_inversion;
const RP = ROTATIONS.rotate_center;
const E2 = ROTATIONS.arc_elliptic;
const EQ = ROTATIONS.vertex_elliptic;

const ROT_ITER = new PowerIterator(RP);
const ROTATE_SEVENFOLD = ROT_ITER.iterate(0, FOLDS_P - 1);
const ROOT_TILE = new CNode(ROTATE_SEVENFOLD, GEOMETRY.circle).bake_tile();

const SMALLER = CVersor.dilation(0.9);
const FUNDAMENTAL_TILE = SMALLER.transform(
  new CTile(...GEOMETRY.edges, ...GEOMETRY.vertices),
);

const STYLES = range(FOLDS_P)
  .toArray()
  .map(
    (i) =>
      new Style({
        stroke: new Oklch(0.7, 0.3, (i / (FOLDS_P - 1)) * 360),
      }),
  );

const MOTIF = new StyledNode(
  ROTATE_SEVENFOLD,
  new StyleRuns([
    [
      1,
      new Style({
        stroke: new Oklch(0.7, 0.3, 200),
      }),
    ],
    [
      1,
      new Style({
        stroke: new Oklch(0.7, 0.3, 300),
      }),
    ],
    [
      FOLDS_P - 2,
      new Style({
        stroke: new Oklch(0.7, 0, 0),
      }),
    ],
  ]),
  FUNDAMENTAL_TILE,
);

const START_TILE = Cline.from_circle(new Circle(Point.ORIGIN, 0.2));

const STYLE_BG = new Style({ stroke: Color.WHITE });
const STYLE_A = new Style({ stroke: Color.RED });
const STYLE_B = new Style({ stroke: Color.BLUE });

const TILE_E2 = E2.transform(MOTIF);
const TILE_V = EQ.transform(MOTIF);

const F_RC = RP.conjugate(FC);

const IDK = F_RC.compose(FC);
const TILE_IDK = IDK.transform(MOTIF);

const IDK_POWERS = new CNode(new PowerIterator(IDK).iterate(-5, 5), MOTIF);

const EACH_XFORM = new CNode([RP, E2, EQ], MOTIF).bake_tile();

const VERTEX_ORBIT = new CNode([EQ, EQ.compose(EQ)], MOTIF).bake_tile();

const BACKGROUND = new StyledTile(
  [Cline.UNIT_CIRCLE /*ROOT_TILE*/, MOTIF, IDK_POWERS],
  STYLE_BG,
);
const RING0 = new StyledTile(START_TILE, STYLE_A);

// E2 gets you into the neighboring tile to the right of the center.
// R^n sandwich E2 for n = 0, 1, ... 6 gives you the 7 directions
const TO_ADJACENT = ROTATE_SEVENFOLD.map((x) => x.conjugate(E2));
const RING1 = new StyledNode(TO_ADJACENT, STYLE_B, START_TILE);

const TO_ADJACENT_RING1 = ROTATE_SEVENFOLD.map((x) => E2.conjugate(x));
// we only want to visit tiles we haven't seen before, so we're only going to
// need a subset of these
// adj(0) points back to the parent, we don't want that
// adj(1) after rotation points to the clockwise sibling, we don't want that
// adj(2) is unvisited, use this
// adj(3)
// adj(5) is new... but it's also the first descendant of our sibling tile, so skip this one
// adj(6) points to the CCW sibling, we don't that one
const XFORMS_RING2 = TO_ADJACENT_RING1.slice(2, 5);
// Now repeat those transforms around the circle
const XFORMS_RING2_REPEATED = ROTATE_SEVENFOLD.flatMap((x) => {
  return XFORMS_RING2.map((y) => x.compose(y));
});
const RING2 = new StyledNode(XFORMS_RING2_REPEATED, STYLE_A, START_TILE);

// for the first tile of ring 7, we need 7 neighbors, and we already have
// 2 parent tiles + 2 siblings, so we need 3 more. Though one will be shared
// with the neighbor tile, so we only actually need 2 here.
const TO_ADJACENT_RING3_1 = ROTATE_SEVENFOLD.map((x) =>
  TO_ADJACENT_RING1[0].conjugate(x),
);
const XFORMS_RING3_1 = TO_ADJACENT_RING3_1[0];
const RING3 = new StyledNode(XFORMS_RING3_1, STYLE_B, START_TILE);

const SCENE = new CTile(BACKGROUND, RING0, RING1, RING2, RING3);
const TO_SCREEN = CVersor.to_screen(new Circle(new Point(250, 350), 250));

export const HYPERBOLIC_TILING_EXPERIMENT = new StaticAnimation(
  TO_SCREEN.transform(SCENE),
);
