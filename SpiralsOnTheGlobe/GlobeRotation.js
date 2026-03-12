import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { TransformationSequence } from "../sketchlib/cga2d/TransformationSequence.js";
import { Color } from "../sketchlib/Color.js";
import { N1 } from "../sketchlib/music/durations.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

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

const STYLE_PARALLELS = new Style({
  stroke: Color.RED,
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

const PARALLEL_ITERATOR = new PowerIterator(CVersor.dilation(1.5));
const PARALLELS = PARALLEL_ITERATOR.iterate(-5, 5).map((x) =>
  x.transform(Cline.UNIT_CIRCLE),
);

const MERIDIAN_ITERATOR = new PowerIterator(
  CVersor.rotation((2 * Math.PI) / 16),
);
const MERIDIANS = MERIDIAN_ITERATOR.iterate(0, 15).map((x) => {
  return x.transform(ClineArc.PRIME_MERIDIAN);
});

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
    this.to_screen = to_screen;

    this.poles = style([], STYLE_POLES);
    this.parallels = style([], STYLE_PARALLELS);
    this.equator = style([], STYLE_EQUATOR);
    this.meridians = style([], STYLE_MERIDIANS);
    this.prime_meridian = style([], STYLE_PRIME_MERIDIAN);
    this.primitive = group(
      this.parallels,
      this.equator,
      this.meridians,
      this.prime_meridian,
      this.poles,
    );
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    const globe_t = CURVE_GLOBE_T.value(time);
    const globe_xform = ROTATE_GLOBE.value(globe_t);

    const xform = this.to_screen.compose(globe_xform);
    const south_pole = xform.transform(NullPoint.ORIGIN);
    const north_pole = xform.transform(NullPoint.INF);
    const parallels = PARALLELS.map((p) => xform.transform(p));
    const equator = xform.transform(Cline.UNIT_CIRCLE);
    const meridians = MERIDIANS.map((m) => xform.transform(m));
    const prime_meridian = xform.transform(ClineArc.PRIME_MERIDIAN);

    this.poles.regroup(south_pole, north_pole);
    this.parallels.regroup(...parallels);
    this.equator.regroup(equator);
    this.meridians.regroup(...meridians);
    this.prime_meridian.regroup(prime_meridian);
  }
}
