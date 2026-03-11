import { Animated } from "../sketchlib/animation/Animated.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
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

const X = rotate_x(1);
const Y = rotate_y(1);
const Z = rotate_z(1);

const YZX = Y.compose(Z).compose(X);
console.log(YZX);

/**
 * Rotate the globe in quarter turns over the course of 6 measures.
 * This does a full loop of the globe
 * @param {number} t time
 * @returns {CVersor}
 */
function rotate_globe(t) {
  t = mod(t, 6);

  // start with the key points
  // [+x, -x, +y, -y, inf, o]

  // x^-t
  // this maps the points to [+x, -x, o, inf, +y, -y]
  if (t < 1) {
    return rotate_x(t);
  }

  // z^-t * x^-1
  // this maps points to [-y, +y, o, inf, +x, -x]
  const x = X;
  if (t < 2) {
    return rotate_z(t).compose(x);
  }

  const zx = Z.compose(X);
  if (t < 3) {
    return rotate_y(t).compose(zx);
  }

  const yxz = Y.compose(zx);
  if (t < 4) {
    return rotate_x(t).compose(yxz);
  }

  const xyxz = X.compose(yxz);
  if (t < 5) {
    return rotate_z(t).compose(xyxz);
  }

  const zxyxz = Z.compose(xyxz);
  return rotate_y(t).compose(zxyxz);
}

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

  update(t) {
    const xform = this.to_screen.compose(rotate_globe(t));
    const south_pole = xform.transform(NullPoint.ORIGIN);
    const north_pole = xform.transform(NullPoint.INF);
    const equator = xform.transform(Cline.UNIT_CIRCLE);
    let prime_meridian;

    if (is_nearly(mod(t, 1.0), 0, 0.01)) {
      //@ts-ignore
      console.log(rotate_globe(t).transform(NullPoint.ORIGIN).point.toString());
    }

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
