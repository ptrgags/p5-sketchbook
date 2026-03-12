import { Animated } from "../sketchlib/animation/Animated.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { Color } from "../sketchlib/Color.js";
import { mod } from "../sketchlib/mod.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";

const STYLE_UNIT_CIRCLE = new Style({
  stroke: Color.from_hex_code("#007f00"),
  width: 4,
});

const STYLE_PARABOLIC = new Style({
  stroke: Color.from_hex_code("#ff7f00"),
  width: 2,
});

const STYLE_LOX = new Style({
  fill: Color.from_hex_code("#7f00ff"),
});

const STYLE_POINTS = new Style({
  fill: Color.from_hex_code("#007f00"),
});

const POINTS = [
  new Point(-0.8, 0.2),
  new Point(-0.8, 0.0),
  new Point(-0.8, -0.2),
].map((x) => NullPoint.from_point(x));
const THREE_POINTS = new CTile(...POINTS);

const N = 40;
const POINTS2 = [...range(N)].map((x) => {
  const point = Point.lerp(new Point(0, -0.8), new Point(0, 0.8), x / (N - 1));
  return NullPoint.from_point(point);
});
const PARABOLIC_POINTS = new CTile(...POINTS2);

const PARABOLIC_ITERATOR = new PowerIterator(
  CVersor.parabolic(Direction.DIR_X),
);
const MAX_EXPONENT = 15;
const PARABOLIC_CIRCLES = PARABOLIC_ITERATOR.iterate(
  -MAX_EXPONENT,
  MAX_EXPONENT,
).map((x) => x.transform(Cline.Y_AXIS));
const PARABOLIC_SCALLOP = new CTile(...PARABOLIC_CIRCLES);

/**
 *
 * @param {Direction} offset_a
 * @param {Direction} offset_b
 * @param {number} t
 * @returns {CVersor}
 */
function slerp_parabolic(offset_a, offset_b, t) {
  const offset = Direction.lerp(offset_a, offset_b, t);
  return CVersor.parabolic(offset);
}

/**
 * @implements {Animated}
 */
export class ConformalXformTest {
  /**
   *
   * @param {CVersor} to_screen
   */
  constructor(to_screen) {
    this.to_screen = to_screen;

    const unit_circle = to_screen.transform(Cline.UNIT_CIRCLE);

    this.parabolic_lines = style([], STYLE_PARABOLIC);
    this.points = style([], STYLE_POINTS);
    this.lox_points = style([], STYLE_LOX);
    this.primitive = group(
      style(unit_circle, STYLE_UNIT_CIRCLE),
      this.parabolic_lines,
      this.points,
      this.lox_points,
    );
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    // slow down time since the animation is too fast
    const t = time / 8;

    const f = 3;
    const angle = 2.0 * Math.PI * f * t;

    const elliptic = CVersor.elliptic(Direction.DIR_Y, angle);
    const elliptic_screen = this.to_screen.compose(elliptic);
    const swirled_points = elliptic_screen.transform(THREE_POINTS);

    const min_factor = 1;
    const max_factor = 100;
    const factor_t = 0.5 + 0.5 * Math.sin(t * 2.0 * Math.PI);
    const factor =
      Math.pow(min_factor, 1.0 - factor_t) * Math.pow(max_factor, factor_t);
    const hyperbolic = CVersor.hyperbolic(Direction.DIR_X, factor);
    const hyp_screen = this.to_screen.compose(hyperbolic);
    const hyp_points = hyp_screen.transform(THREE_POINTS);

    const parabolic = slerp_parabolic(
      Direction.DIR_X.scale(-100),
      Direction.DIR_X.scale(100),
      t,
    );
    const para_screen = this.to_screen.compose(parabolic);
    const para_points = para_screen.transform(PARABOLIC_POINTS);

    this.points.regroup(swirled_points, hyp_points, para_points);

    const lox = elliptic.compose(hyperbolic);
    const lox_screen = this.to_screen.compose(lox);
    const lox_points = lox_screen.transform(THREE_POINTS);
    this.lox_points.regroup(lox_points);

    // Give the illusion of translating forever by drawing a whole bunch of tiles
    const t_repeat = mod(2 * t, 1.0);
    const para_illusion = slerp_parabolic(
      Direction.ZERO,
      Direction.DIR_X,
      t_repeat,
    );
    const para_ill_screen = this.to_screen.compose(para_illusion);
    const scallop = para_ill_screen.transform(PARABOLIC_SCALLOP);
    this.parabolic_lines.regroup(scallop);
  }
}
