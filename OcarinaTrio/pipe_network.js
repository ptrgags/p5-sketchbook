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

/**
 *
 * @param {number} y
 * @param {number} a
 * @param {number} b
 * @returns {LineSegment}
 */
function hline(y, a, b) {
  return new LineSegment(new Point(a, y), new Point(b, y));
}

/**
 *
 * @param {number} x
 * @param {number} a
 * @param {number} b
 * @returns {LineSegment}
 */
function vline(x, a, b) {
  return new LineSegment(new Point(x, a), new Point(x, b));
}

const COMMON_SEGMENTS = [
  make_arc(450, 200, 0, -1),
  vline(475, 200, 150),
  make_arc(450, 150, 3, -1),
  hline(125, 450, 50),
  make_arc(50, 150, 2, -1),
  vline(25, 150, 175),
  make_arc(50, 175, 1, -1),
  hline(200, 50, 225),
  make_arc(225, 175, 0, -1),
  vline(250, 175, 125),
];

export const PIPE_TREE_BASS = DashedTree.from_segments([
  make_arc(125, 250, 2, 1),
  hline(225, 125, 450),
  ...COMMON_SEGMENTS,
  [
    make_arc(225, 125, 3, -1),
    hline(100, 225, 175),
    [
      hline(100, 175, 100),
      make_arc(100, 75, 1, 1),
      make_arc(50, 75, 3, -1),
      // these two are supposed to be a bezier curve
      make_arc(50, 75, 2, -1),
      make_arc(0, 75, 0, 1),
    ],
    [
      make_arc(175, 75, 1, 1),
      // I changed the path a bit to avoid bezier curves
      vline(150, 75, 50),
      make_arc(125, 50, 3, -1),
      hline(25, 125, 0),
    ],
  ],
  [
    vline(250, 125, 50),
    // these two should be a bezier curve
    make_arc(225, 50, 3, -1),
    make_arc(225, 0, 1, 1),
  ],
  [
    make_arc(275, 125, 2, 1),
    // this path uses bezier curves
    make_arc(275, 75, 0, -1),
    vline(300, 75, 0),
  ],
]);

// there are some additional branches on the right side, but without bezier
// curves I can't fit more in right now.
export const PIPE_TREE_TENOR = DashedTree.from_segments([
  make_arc(275, 250, 2, 1),
  hline(225, 275, 450),
  ...COMMON_SEGMENTS,
  [
    make_arc(225, 125, 3, -1),
    hline(100, 225, 175),
    [
      hline(100, 175, 100),
      make_arc(100, 75, 1, 1),
      make_arc(50, 75, 3, -1),
      hline(50, 50, 0),
    ],
    [
      make_arc(175, 75, 1, 1),
      // I changed the path a bit to avoid bezier curves
      vline(150, 75, 50),
      make_arc(125, 50, 3, -1),
      hline(25, 125, 50),
      make_arc(50, 0, 1, 1),
    ],
  ],
  [vline(250, 125, 0)],
  [
    make_arc(275, 125, 2, 1),
    hline(100, 275, 300),
    [make_arc(300, 75, 0, -1), vline(325, 75, 0)],
    [hline(100, 300, 350), [make_arc(350, 75, 0, -1), vline(375, 75, 0)]],
  ],
]);

export const PIPE_TREE_SOPRANO = DashedTree.from_segments([
  make_arc(425, 250, 2, 1),
  hline(225, 425, 450),
  ...COMMON_SEGMENTS,
  [
    make_arc(225, 125, 3, -1),
    [
      hline(100, 225, 175),
      [make_arc(175, 75, 1, 1), vline(150, 75, 0)],
      [hline(100, 175, 100), make_arc(100, 75, 1, 1), vline(75, 75, 0)],
    ],
    [
      make_arc(225, 75, 1, 1),
      // this path is different
      vline(200, 75, 0),
    ],
  ],
  [
    vline(250, 125, 100),
    // this part is different
    make_arc(275, 100, 2, 1),
    make_arc(275, 50, 0, -1),
    vline(300, 50, 0),
  ],
  [
    make_arc(275, 125, 2, 1),
    // this is a little different
    hline(100, 275, 350),
    [
      make_arc(350, 75, 0, -1),
      vline(375, 75, 50),
      make_arc(400, 50, 2, 1),
      hline(25, 400, 425),
      make_arc(425, 0, 0, -1),
    ],
    [
      hline(100, 350, 400),
      [make_arc(400, 75, 0, -1), make_arc(450, 75, 2, 1), hline(50, 450, 500)],
      [hline(100, 400, 500)],
    ],
  ],
]);

PIPE_TREE_BASS.measure_lengths();
PIPE_TREE_TENOR.measure_lengths();
PIPE_TREE_SOPRANO.measure_lengths();
