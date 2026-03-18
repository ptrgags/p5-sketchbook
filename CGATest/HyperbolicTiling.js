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
import { ConformalPrimitive } from "../sketchlib/cga2d/ConfomalPrimitive.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { StyledNode } from "../sketchlib/cga2d/StyledNode.js";
import { StyledTile } from "../sketchlib/cga2d/StyledTile.js";
import { Color } from "../sketchlib/Color.js";
import { mod } from "../sketchlib/mod.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";
import { StyleRuns } from "../sketchlib/styling/StyleRuns.js";
import { OrbitTile } from "./OrbitTile.js";

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

const EDGE_MIDPOINT = GEOMETRY.vertices[1];
const BIG_ARC = ClineArc.from_arc(
  new ArcPrimitive(
    Point.ORIGIN,
    EDGE_MIDPOINT.point.x,
    new ArcAngles(
      (2 * Math.PI) / FOLDS_P,
      ((FOLDS_P - 1) / FOLDS_P) * 2 * Math.PI,
    ),
  ),
);

// The transformations to adjacent tiles reminded me of a scallop shape.
// computing the circular arcs for that is tricky right now (computing a circle from 3 points would help!)
// so for now just draw the outline which gives a petal shape
const ROOT_PETAL = new CTile(
  ClineArc.from_segment(new LineSegment(EDGE_MIDPOINT.point, BIG_ARC.a.point)),
  BIG_ARC,
  ClineArc.from_segment(new LineSegment(BIG_ARC.c.point, EDGE_MIDPOINT.point)),
);
const PETAL = new StyledTile(
  E2.transform(ROOT_PETAL),
  new Style({ stroke: Color.CYAN }),
);

// EDIT: not quite right, this is only true for edge-top tiles. Vertex-top tiles
// need one more segment... I need to think about this.
//
// For interior nodes of the graph, we only need to draw 2 out of 7
// walls, as the rest will be handled by other iterations
const ROOT_CELL_WALLS = new CTile(
  GEOMETRY.tile_edge,
  RP.transform(GEOMETRY.tile_edge),
);
const CELL_WALLS = new StyledTile(
  E2.transform(ROOT_CELL_WALLS),
  new Style({ stroke: Color.from_hex_code("#7F00FF"), width: 2 }),
);
const MOTIF = new CTile(PETAL);

// To go into a transformation, remember to C{R}Y 😢
// where:
// - C is circle inversion in the circular arc edge of the root tile
// - {R} is the set of rotations {R^n | n in [0, 1, ... q - 1]}
// - Y is reflection in t
//
// {R}Y represents reflection in lines through the center of the root tile.
// For lines that intersect the circular arc, C{R}Y we get an elliptic transformation
// For lines that do not intersect the circular arc, C{R}Y is a hyperbolic transformation
const TO_ADJ = range(7)
  .toArray()
  .map((i) => {
    // In CCW order from the original circular arc, we need need:
    // CR^0Y, CR^6Y, CR^5Y, ... C^1Y
    // The powers 0, 6, 5, ..., 1 are equivalent to 0, -1, -2, ..., -6 (mod p)
    // but we can just use a negative array index to do the same thing.
    const r = ROTATE_SEVENFOLD.at(-i);
    return FC.compose(r).compose(FY);
  });
const ORBIT_TILE = new OrbitTile(MOTIF, CVersor.IDENTITY, TO_ADJ);

/**
 * @enum {number}
 */
const TileType = {
  EDGE: 0,
  VERTEX: 1,
};

/**
 *
 * @param {ConformalPrimitive[]} output
 * @param {OrbitTile} tile
 * @param {TileType} tile_type
 * @param {number} remaining_height
 */
function render_tile73(output, tile, tile_type, remaining_height) {
  output.push(tile.motif);
  if (remaining_height === 0) {
    return;
  }

  const start_index = tile_type === TileType.EDGE ? 2 : 3;
  const remaining_indices = tile_type === TileType.EDGE ? [3, 4] : [4];

  render_tile73(
    output,
    tile.step(start_index),
    TileType.VERTEX,
    remaining_height - 1,
  );
  for (const index of remaining_indices) {
    render_tile73(
      output,
      tile.step(index),
      TileType.EDGE,
      remaining_height - 1,
    );
  }
}

/**
 * @param {OrbitTile} first_tile
 * @param {number} max_height How many levels to generate
 * @returns {CTile}
 */
function render_tiling73(first_tile, max_height) {
  const output = [];

  ROTATE_SEVENFOLD.forEach((r) => {
    const tile = first_tile.transform(r.versor);
    render_tile73(output, tile, TileType.EDGE, max_height);
  });

  return new CTile(...output);
}

const TILE73 = render_tiling73(ORBIT_TILE, 4);

const STYLE_BG = new Style({ stroke: Color.WHITE });
const BACKGROUND = new StyledTile([Cline.UNIT_CIRCLE], STYLE_BG);

const SCENE = new CTile(BACKGROUND, TILE73);
const TO_SCREEN = CVersor.to_screen(new Circle(new Point(250, 350), 250));

export const HYPERBOLIC_TILING_EXPERIMENT = new StaticAnimation(
  TO_SCREEN.transform(SCENE),
);
