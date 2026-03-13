import { Animated } from "../sketchlib/animation/Animated.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { StyledTile } from "../sketchlib/cga2d/StyledTile.js";
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
const PARABOLIC_SCALLOP = new StyledTile(PARABOLIC_CIRCLES, STYLE_PARABOLIC);

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

const STYLED_CIRCLE = new StyledTile([Cline.UNIT_CIRCLE], STYLE_UNIT_CIRCLE);

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

    const unit_circle = to_screen.transform(STYLED_CIRCLE);

    // the scallop animation and the parabolic points animate differently,
    // so we need two transformation nodes.
    this.scallop_node = new CNode(CVersor.IDENTITY, PARABOLIC_SCALLOP);
    this.parabolic_point_node = new CNode(CVersor.IDENTITY, PARABOLIC_POINTS);

    // temporary until I implement StyleNode
    const temp_styled_points = new StyledTile([THREE_POINTS], STYLE_POINTS);
    const temp_styled_lox = new StyledTile([THREE_POINTS], STYLE_LOX);

    this.point_node = new CNode(CVersor.IDENTITY, temp_styled_points);
    this.lox_node = new CNode(CVersor.IDENTITY, temp_styled_lox);

    this.primitive = new CTile(
      unit_circle,
      new CNode(
        to_screen,
        new CTile(this.scallop_node, this.point_node, this.lox_node),
      ),
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

    const min_factor = 1;
    const max_factor = 100;
    const factor_t = 0.5 + 0.5 * Math.sin(t * 2.0 * Math.PI);
    const factor =
      Math.pow(min_factor, 1.0 - factor_t) * Math.pow(max_factor, factor_t);
    const hyperbolic = CVersor.hyperbolic(Direction.DIR_X, factor);

    this.point_node.update_transforms(elliptic, hyperbolic);

    // Show the loxodromic transformation L = E * H = H * E
    const lox = elliptic.compose(hyperbolic);
    this.lox_node.update_transforms(lox);

    const parabolic = slerp_parabolic(
      Direction.DIR_X.scale(-100),
      Direction.DIR_X.scale(100),
      t,
    );
    this.parabolic_point_node.update_transforms(parabolic);

    // Give the illusion of translating forever by drawing a whole bunch of tiles
    const t_repeat = mod(2 * t, 1.0);
    const para_illusion = slerp_parabolic(
      Direction.ZERO,
      Direction.DIR_X,
      t_repeat,
    );
    this.scallop_node.update_transforms(para_illusion);
  }
}
