import { Animated } from "../sketchlib/animation/Animated.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { Color } from "../sketchlib/Color.js";
import { mod } from "../sketchlib/mod.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

/**
 *
 * @param {number} t
 * @returns {CVersor}
 */
function rotate_z(t) {
  const angle = 0.5 * Math.PI * t;
  return CVersor.rotation(angle);
}

/**
 *
 * @param {number} t
 * @returns {CVersor}
 */
function rotate_x(t) {
  const angle = 0.5 * Math.PI * t;
  return CVersor.elliptic(Direction.DIR_Y, angle);
}

/**
 *
 * @param {number} t
 * @returns {CVersor}
 */
function rotate_y(t) {
  const angle = 0.5 * Math.PI * t;
  return CVersor.elliptic(Direction.DIR_X.neg(), angle);
}

/**
 * Rotate the globe in quarter turns over the course of 6 measures.
 * This does a full loop of the globe
 * @param {number} t time
 * @returns {CVersor}
 */
function rotate_globe(t) {
  t = mod(t, 6);

  if (t < 1) {
    return rotate_x(t);
  }

  const x = rotate_x(1);
  if (t < 2) {
    return rotate_z(t).compose(x);
  }

  const z = rotate_z(1);
  const zx = z.compose(x);
  if (t < 3) {
    return rotate_y(t).compose(zx);
  }

  const y = rotate_y(1);
  const yxz = y.compose(zx);
  if (t < 4) {
    return rotate_x(t).compose(yxz);
  }

  const xyxz = x.compose(yxz);
  if (t < 5) {
    return rotate_z(t).compose(xyxz);
  }

  const zxyxz = z.compose(xyxz);
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
    const prime_meridian = xform.transform(ClineArc.PRIME_MERIDIAN);

    this.poles.regroup(south_pole, north_pole);
    this.parallels.regroup(equator);
    this.meridians.regroup(prime_meridian);
  }
}
