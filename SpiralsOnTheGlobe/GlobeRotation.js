import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { StyledTile } from "../sketchlib/cga2d/StyledTile.js";
import { TransformationSequence } from "../sketchlib/cga2d/TransformationSequence.js";
import { Color } from "../sketchlib/Color.js";
import { N1 } from "../sketchlib/music/durations.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Style } from "../sketchlib/Style.js";
import { StyleRuns } from "../sketchlib/styling/StyleRuns.js";

/**
 * Rotate the globe a quarter turn CCW around the z axis (through the poles)
 * as t goes from [0, 1]. This is a regular rotation.
 *
 * Fixes o, inf
 * cycles +x -> +y -> -x -> -y -> +x
 * @param {number} t
 * @returns {CVersor}
 */
function rotate_z(t) {
  const angle = 0.5 * Math.PI * t;
  return CVersor.rotation(angle);
}

/**
 * Rotate the globe a quarter turn CCW around the x axis as t goes from [0, 1]
 *
 * This fixes +x, -x
 * and cycles o -> +y -> inf -> -y -> o
 * @param {number} t
 * @returns {CVersor}
 */
function rotate_x(t) {
  const angle = 0.5 * Math.PI * t;
  return CVersor.elliptic(Direction.DIR_Y, angle);
}

/**
 * Rotate the globe a quarter turn CCW around the y-axis as t goes from [0, 1]
 *
 * This fixes +y, -y
 * and cycles o -> -x -> inf -> +x -> o
 * @param {number} t
 * @returns {CVersor}
 */
function rotate_y(t) {
  const angle = 0.5 * Math.PI * t;
  return CVersor.elliptic(Direction.DIR_X.neg(), angle);
}
const ROTATE_GLOBE = new TransformationSequence([
  rotate_x,
  rotate_z,
  rotate_y,
  rotate_x,
  rotate_z,
  rotate_y,
]);

const STYLE_POLES = new Style({
  fill: Color.from_hex_code("#7f00ff"),
});

const STYLE_NORTH_HEMISPHERE = new Style({
  stroke: Color.RED,
  width: 2,
});
const STYLE_SOUTH_HEMISPHERE = new Style({
  stroke: Color.from_hex_code("#ff7f00"),
  width: 2,
});
const STYLE_EQUATOR = new Style({
  stroke: Color.CYAN,
  width: 4,
});

const STYLE_MERIDIANS = new Style({
  stroke: Color.YELLOW,
  width: 2,
});

const STYLE_PRIME_MERIDIAN = new Style({
  stroke: Color.BLUE,
  width: 4,
});

const PARALLEL_MAX_ITERS = 5;
const PARALLEL_ITERATOR = new PowerIterator(CVersor.dilation(1.5));
const PARALLEL_CLINES = PARALLEL_ITERATOR.iterate(
  -PARALLEL_MAX_ITERS,
  PARALLEL_MAX_ITERS,
).map((x) => x.transform(Cline.UNIT_CIRCLE));

// Color the equator differently so it stands out. Also color the
// hemispheres different colors so you can tell which way is up.
const STYLE_RUNS_PARALLELS = new StyleRuns([
  [PARALLEL_MAX_ITERS, STYLE_SOUTH_HEMISPHERE],
  [1, STYLE_EQUATOR],
  [PARALLEL_MAX_ITERS, STYLE_NORTH_HEMISPHERE],
]);

const MERIDIAN_COUNT = 16;
const MERIDIAN_ITERATOR = new PowerIterator(
  CVersor.rotation((2 * Math.PI) / MERIDIAN_COUNT),
);
const MERIDIAN_ARCS = MERIDIAN_ITERATOR.iterate(0, MERIDIAN_COUNT - 1).map(
  (x) => {
    return x.transform(ClineArc.PRIME_MERIDIAN);
  },
);
// Color the prime meridian differently so it stands out
const STYLE_RUNS_MERIDIANS = new StyleRuns([
  [1, STYLE_PRIME_MERIDIAN],
  [MERIDIAN_COUNT - 1, STYLE_MERIDIANS],
]);

const PARALLELS = new StyledTile(PARALLEL_CLINES, STYLE_RUNS_PARALLELS);
const MERIDIANS = new StyledTile(MERIDIAN_ARCS, STYLE_RUNS_MERIDIANS);
const POLES = new StyledTile([NullPoint.ORIGIN, NullPoint.INF], STYLE_POLES);
const GEOMETRY = new CTile(PARALLELS, MERIDIANS, POLES);

const CURVE_GLOBE_T = LoopCurve.from_timeline(
  new Sequential(
    new Hold(N1),
    make_param(0, 1 / 6, N1),
    new Hold(N1),
    make_param(1 / 6, 2 / 6, N1),
    new Hold(N1),
    make_param(2 / 6, 3 / 6, N1),
    new Hold(N1),
    make_param(3 / 6, 4 / 6, N1),
    new Hold(N1),
    make_param(4 / 6, 5 / 6, N1),
    new Hold(N1),
    make_param(5 / 6, 1, N1),
  ),
);

/**
 * @implements {Animated}
 */
export class GlobeRotation {
  /**
   *
   * @param {CVersor} to_screen
   */
  constructor(to_screen) {
    this.rotate_node = new CNode(CVersor.IDENTITY, GEOMETRY);
    this.primitive = new CNode(to_screen, this.rotate_node);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    const globe_t = CURVE_GLOBE_T.value(time);
    const globe_xform = ROTATE_GLOBE.value(globe_t);
    this.rotate_node.update_transforms(globe_xform);
  }
}
