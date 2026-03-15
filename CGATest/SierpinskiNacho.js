import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { Color } from "../sketchlib/Color.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Style } from "../sketchlib/Style.js";
import { MAX_ITERS } from "./AnimatedSierpinski.js";
import { FractalPrefixAnimation } from "./FractalPrefixAnimation.js";

/**
 * Hyperbolic mobius map that moves the origin to a specific point inside the unit circle
 * @param {Direction} displacement displacement from the origin. It must be inside the unit circle
 * @returns {function(number): CVersor}
 */
function hyperbolic_to_point(displacement) {
  const length = displacement.mag();
  const direction = displacement.normalize();

  const scale_factor = Math.exp(2 * Math.atanh(length));
  return function (t) {
    return CVersor.hyperbolic(direction, scale_factor ** t);
  };
}

const RADIUS_A = Math.SQRT2 - 1;
function nacho_a(t) {
  const scale_factor = RADIUS_A ** t;
  return CVersor.dilation(scale_factor);
}
const nacho_b = hyperbolic_to_point(new Direction(RADIUS_A, 0));
const nacho_c = hyperbolic_to_point(new Direction(0, RADIUS_A));
const NACHO_FUNCTIONS = [nacho_a, nacho_b, nacho_c];

const STYLE_NACHO = new Style({
  stroke: Color.from_hex_code("#ff7f00"),
  width: 2,
});
const NACHO = new CTile(
  ClineArc.from_segment(new LineSegment(Point.ORIGIN, new Point(1, 0))),
  ClineArc.from_arc(
    new ArcPrimitive(Point.ORIGIN, 1, new ArcAngles(0, Math.PI / 2)),
  ),
  ClineArc.from_segment(new LineSegment(new Point(0, 1), Point.ORIGIN)),
);

export const NACHO_FRACTAL = new FractalPrefixAnimation(
  NACHO_FUNCTIONS,
  MAX_ITERS,
  NACHO,
  STYLE_NACHO,
);
