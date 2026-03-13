import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { StyledNode } from "../sketchlib/cga2d/StyledNode.js";
import { Color } from "../sketchlib/Color.js";
import { mod } from "../sketchlib/mod.js";
import { N1 } from "../sketchlib/music/durations.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { range } from "../sketchlib/range.js";
import { Rational } from "../sketchlib/Rational.js";
import { Style } from "../sketchlib/Style.js";
import { StyleRuns } from "../sketchlib/styling/StyleRuns.js";
import { whole_fract } from "../sketchlib/whole_fract.js";

const A = new Point(-1, -1);
const B = new Point(1, -1);
const C = new Point(1, 1);
const D = new Point(-1, 1);

// (signed) unit square, [-1, 1] in both directions.
const UNIT_SQUARE = new CTile(
  ClineArc.from_segment(new LineSegment(A, B)),
  ClineArc.from_segment(new LineSegment(B, C)),
  ClineArc.from_segment(new LineSegment(C, D)),
  ClineArc.from_segment(new LineSegment(D, A)),
);

const STYLE_PARENT = new Style({
  stroke: Color.WHITE,
  width: 2,
});
const STYLE_CHILD_A = new Style({
  stroke: Color.RED,
  width: 2,
});
const STYLE_CHILD_B = new Style({
  stroke: Color.BLUE,
  width: 2,
});
const STYLE_RUNS = StyleRuns.from_styles([
  STYLE_PARENT,
  STYLE_CHILD_A,
  STYLE_CHILD_B,
]);

// both transformations map the unit square's diagonal
// to one of its sides. 2/(2sqrt(2)) = 1/sqrt(2)
const SCALE_FACTOR = Math.SQRT1_2;
// Both transformations rotate the square 1/8 turn,
// the direction depends on the transformation
const TURN_ANGLE = Math.PI / 4;
const TRANSLATION_A = CVersor.translation(new Direction(-1, -1));
const TRANSLATION_B = CVersor.translation(new Direction(1, 1));

function dragon_a(t) {
  const scale = CVersor.dilation(Math.pow(SCALE_FACTOR, t));
  const rotation = CVersor.rotation(-TURN_ANGLE * t);
  const rs = rotation.compose(scale);
  return TRANSLATION_A.conjugate(rs);
}
function dragon_b(t) {
  const scale = CVersor.dilation(Math.pow(SCALE_FACTOR, t));
  const rotation = CVersor.rotation(-TURN_ANGLE * t);
  const rs = rotation.compose(scale);
  return TRANSLATION_B.conjugate(rs);
}

const DRAGON_IFS = new IFS([dragon_a(1), dragon_b(1)]);

const MAX_ITERS = 9;
const PREFIXES = range(MAX_ITERS + 1)
  .toArray()
  .map((depth) => DRAGON_IFS.iterate(depth));

const CURVE_ITERATION = LoopCurve.from_timeline(
  new Sequential(
    new Hold(N1),
    make_param(0, MAX_ITERS + 1, new Rational(MAX_ITERS + 1)),
    new Hold(N1),
  ),
);

/**
 * @implements {Animated}
 */
export class DragonCurveAnimation {
  /**
   * Constructor
   * @param {CVersor} to_screen
   */
  constructor(to_screen) {
    // we only need to update the local shape
    this.local_animation = new StyledNode(
      CVersor.IDENTITY,
      STYLE_RUNS,
      UNIT_SQUARE,
    );
    // fractal transformations from the IFS will go here
    this.fractal_node = new CNode(CVersor.IDENTITY, this.local_animation);
    this.primitive = new CNode(to_screen, this.fractal_node);
  }

  update(time) {
    const [iteration, t] = whole_fract(CURVE_ITERATION.value(time));
    if (iteration < MAX_ITERS) {
      const xform_a = dragon_a(t);
      const xform_b = dragon_b(t);
      this.local_animation.update_transforms(
        CVersor.IDENTITY,
        xform_a,
        xform_b,
      );
      this.local_animation.styles = STYLE_RUNS;
      this.fractal_node.update_transforms(...PREFIXES[iteration]);
    } else {
      this.local_animation.update_transforms(CVersor.IDENTITY);
      this.local_animation.styles = STYLE_PARENT;
      this.fractal_node.update_transforms(...PREFIXES.at(-1));
    }
  }
}
