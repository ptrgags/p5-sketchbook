import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { DashedTree } from "./DashedTree.js";

const BEND_RADIUS = 25;
const ARCS_CW = [
  new ArcAngles(0, Math.PI / 2),
  new ArcAngles(Math.PI / 2, Math.PI),
  new ArcAngles(Math.PI, (3 * Math.PI) / 2),
  new ArcAngles((3 * Math.PI) / 2, 2 * Math.PI),
];

/**
 * There are quite a number of arcs, so make some
 * shorthand
 * @param {number} x
 * @param {number} y
 * @param {0 | 1 | 2 | 3} quadrant
 * @param {-1 | 1} direction
 * @returns {ArcPrimitive}
 */
function make_arc(x, y, quadrant, direction) {
  const quad_angles = ARCS_CW[quadrant];
  const angles = direction === -1 ? quad_angles.reverse() : quad_angles;
  return new ArcPrimitive(new Point(x, y), BEND_RADIUS, angles);
}

const COMMON_SEGMENTS = [
  make_arc(450, 200, 0, -1),
  new LineSegment(new Point(475, 200), new Point(475, 150)),
  make_arc(450, 150, 3, -1),
  new LineSegment(new Point(450, 125), new Point(50, 125)),
  make_arc(50, 150, 2, -1),
  new LineSegment(new Point(25, 150), new Point(25, 175)),
  make_arc(50, 175, 1, -1),
  new LineSegment(new Point(50, 200), new Point(225, 200)),
  make_arc(225, 175, 0, -1),
  new LineSegment(new Point(250, 175), new Point(250, 125)),
];

export const PIPE_TREE_BASS = DashedTree.from_segments(COMMON_SEGMENTS);
export const PIPE_TREE_TENOR = DashedTree.from_segments(COMMON_SEGMENTS);
export const PIPE_TREE_SOPRANO = DashedTree.from_segments(COMMON_SEGMENTS);

PIPE_TREE_BASS.measure_lengths();
PIPE_TREE_TENOR.measure_lengths();
PIPE_TREE_SOPRANO.measure_lengths();
