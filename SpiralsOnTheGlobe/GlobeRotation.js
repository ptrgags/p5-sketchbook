import { Animated } from "../sketchlib/animation/Animated.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { TransformationSequence } from "../sketchlib/cga2d/TransformationSequence.js";
import { Color } from "../sketchlib/Color.js";
import { is_nearly } from "../sketchlib/is_nearly.js";
import { mod } from "../sketchlib/mod.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
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
const GLOBE_PERIOD = 6;

const STYLE_POLES = new Style({
  fill: Color.from_hex_code("#7f00ff"),
});

const STYLE_PARALLELS = new Style({
  stroke: Color.RED,
});

const STYLE_MERIDIANS = new Style({
  stroke: Color.YELLOW,
});

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
    this.meridians = style([], STYLE_MERIDIANS);
    this.primitive = group(this.poles, this.parallels, this.meridians);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    const globe_t = mod(time / GLOBE_PERIOD, 1);
    const globe_xform = ROTATE_GLOBE.value(globe_t);

    const xform = this.to_screen.compose(globe_xform);
    const south_pole = xform.transform(NullPoint.ORIGIN);
    const north_pole = xform.transform(NullPoint.INF);
    const equator = xform.transform(Cline.UNIT_CIRCLE);
    let prime_meridian;

    try {
      prime_meridian = xform.transform(ClineArc.PRIME_MERIDIAN);
    } catch (e) {
      console.error("inf problem", e);
      prime_meridian = Primitive.EMPTY;
    }

    this.poles.regroup(south_pole, north_pole);
    this.parallels.regroup(equator);
    this.meridians.regroup(prime_meridian);
  }
}
