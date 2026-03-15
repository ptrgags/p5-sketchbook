import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { ConformalPrimitive } from "../sketchlib/cga2d/ConfomalPrimitive.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { StyledNode } from "../sketchlib/cga2d/StyledNode.js";
import { StyledTile } from "../sketchlib/cga2d/StyledTile.js";
import { Color } from "../sketchlib/Color.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Rational } from "../sketchlib/Rational.js";
import { Style } from "../sketchlib/Style.js";
import { whole_fract } from "../sketchlib/whole_fract.js";

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

const STYLE_NACHO = new Style({ stroke: Color.from_hex_code("#ff7f00") });
const NACHO = new CTile(
  ClineArc.from_segment(new LineSegment(Point.ORIGIN, new Point(1, 0))),
  ClineArc.from_arc(
    new ArcPrimitive(Point.ORIGIN, 1, new ArcAngles(0, Math.PI / 2)),
  ),
  ClineArc.from_segment(new LineSegment(new Point(0, 1), Point.ORIGIN)),
);
const NACHO_IFS = new IFS([nacho_a(1), nacho_b(1), nacho_c(1)]);

const CURVE_A = LoopCurve.from_timeline(
  new Sequential(
    make_param(0, 1, new Rational(1, 3)),
    new Hold(new Rational(2, 3)),
  ),
);
const CURVE_B = LoopCurve.from_timeline(
  new Sequential(
    new Hold(new Rational(1, 3)),
    make_param(0, 1, new Rational(1, 3)),
    new Hold(new Rational(1, 3)),
  ),
);
const CURVE_C = LoopCurve.from_timeline(
  new Sequential(
    new Hold(new Rational(2, 3)),
    make_param(0, 1, new Rational(1, 3)),
  ),
);
const CURVE_INFINITE_LOOP = LoopCurve.from_timeline(
  make_param(0, 3, new Rational(1)),
);

const MAX_ITERS = 5;
const ITER_PRIMS = new Array(MAX_ITERS + 1);
ITER_PRIMS[0] = NACHO;
for (let i = 0; i < MAX_ITERS; i++) {
  ITER_PRIMS[i] = new CNode(NACHO_IFS.iterate(i), NACHO).bake_tile();
}

/**
 * Port of {@link https://github.com/ptrgags/math-notebook/blob/main/artworks/examples/nacho.rs | Sierpinski Nacho} from my
 * math-notebook repo
 *
 * @implements {Animated}
 */
export class SierpinskiNacho {
  /**
   * Constructor
   * @param {CVersor} to_screen
   */
  constructor(to_screen) {
    this.root = new CNode(CVersor.IDENTITY, ConformalPrimitive.EMPTY);
    this.primitive = new StyledNode(to_screen, STYLE_NACHO, this.root);
  }

  update(time) {
    const iter_index = Math.min(Math.floor(time), ITER_PRIMS.length - 1);
    this.root.primitive = ITER_PRIMS[iter_index];

    if (time < MAX_ITERS) {
      const t_a = CURVE_A.value(time);
      const t_b = CURVE_B.value(time);
      const t_c = CURVE_C.value(time);

      const xform_a = nacho_a(t_a);
      const xform_b = nacho_b(t_b);
      const xform_c = nacho_c(t_c);

      this.root.update_transforms(xform_c, xform_b, xform_a);
    } else {
      const param = CURVE_INFINITE_LOOP.value(time);
      const [xform_index, xform_t] = whole_fract(param);
      const xform = NACHO_FUNCTIONS[xform_index](xform_t);

      this.root.update_transforms(CVersor.IDENTITY, xform);
    }
  }
}
