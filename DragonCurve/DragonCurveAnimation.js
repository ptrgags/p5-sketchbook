import { Animated } from "../sketchlib/animation/Animated.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { StyledNode } from "../sketchlib/cga2d/StyledNode.js";
import { StyledTile } from "../sketchlib/cga2d/StyledTile.js";
import { Color } from "../sketchlib/Color.js";
import { mod } from "../sketchlib/mod.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Style } from "../sketchlib/Style.js";
import { StyleRuns } from "../sketchlib/styling/StyleRuns.js";

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
});
const STYLE_CHILD_A = new Style({
  stroke: Color.RED,
});
const STYLE_CHILD_B = new Style({
  stroke: Color.BLUE,
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
    const t = mod(time, 1);
    const xform_a = dragon_a(t);
    const xform_b = dragon_b(t);

    this.local_animation.update_transforms(CVersor.IDENTITY, xform_a, xform_b);
  }
}
