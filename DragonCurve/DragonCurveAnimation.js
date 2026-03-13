import { Animated } from "../sketchlib/animation/Animated.js";
import { LoopCurve } from "../sketchlib/animation/LoopCurve.js";
import { Hold, make_param } from "../sketchlib/animation/ParamCurve.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { CTile } from "../sketchlib/cga2d/CTile.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { StyledNode } from "../sketchlib/cga2d/StyledNode.js";
import { StyledTile } from "../sketchlib/cga2d/StyledTile.js";
import { N1 } from "../sketchlib/music/durations.js";
import { Sequential } from "../sketchlib/music/Timeline.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { range } from "../sketchlib/range.js";
import { Rational } from "../sketchlib/Rational.js";
import { Style } from "../sketchlib/Style.js";
import { StyleRuns } from "../sketchlib/styling/StyleRuns.js";
import { whole_fract } from "../sketchlib/whole_fract.js";

// make a vortex shape across the diagonal of the (signed) unit square using
// 4 circular arcs + another circle in the center
const BOTTOM_LEFT = new Point(-1, -1);
const TOP_RIGHT = new Point(1, 1);
const QUARTER = Point.lerp(BOTTOM_LEFT, TOP_RIGHT, 0.25);
const THREE_QUARTERS = Point.lerp(BOTTOM_LEFT, TOP_RIGHT, 0.75);
const CIRCLE1 = Circle.from_two_points(BOTTOM_LEFT, THREE_QUARTERS);
const CIRCLE2 = Circle.from_two_points(THREE_QUARTERS, TOP_RIGHT);
const CIRCLE3 = Circle.from_two_points(TOP_RIGHT, QUARTER);
const CIRCLE4 = Circle.from_two_points(QUARTER, BOTTOM_LEFT);
const ARC1 = new ArcPrimitive(
  CIRCLE1.center,
  CIRCLE1.radius,
  new ArcAngles((-3 * Math.PI) / 4, Math.PI / 4),
);
const ARC2 = new ArcPrimitive(
  CIRCLE2.center,
  CIRCLE2.radius,
  new ArcAngles((5 * Math.PI) / 4, Math.PI / 4),
);
const ARC3 = new ArcPrimitive(
  CIRCLE3.center,
  CIRCLE3.radius,
  new ArcAngles(Math.PI / 4, (5 * Math.PI) / 4),
);
const ARC4 = new ArcPrimitive(
  CIRCLE4.center,
  CIRCLE4.radius,
  new ArcAngles(Math.PI / 4, (-3 * Math.PI) / 4),
);
const VORTEX = new CTile(
  Cline.from_circle(new Circle(Point.ORIGIN, 0.25)),
  ClineArc.from_arc(ARC1),
  ClineArc.from_arc(ARC2),
  ClineArc.from_arc(ARC3),
  ClineArc.from_arc(ARC4),
);

const SPIN_ANGULAR_FREQUENCY = 2 * Math.PI;
function spin(t) {
  return CVersor.rotation(SPIN_ANGULAR_FREQUENCY * t);
}

const STYLE_PARENT = new Style({
  stroke: new Oklch(0.9, 0, 0),
  width: 2,
});
const STYLE_CHILD_A = new Style({
  // cinnamon red
  stroke: new Oklch(0.6, 0.1389, 17.63),
  width: 4,
});
const STYLE_CHILD_B = new Style({
  // mint green
  stroke: new Oklch(0.8, 0.1, 176.8),
  width: 4,
});
const STYLE_RUNS = StyleRuns.from_styles([STYLE_CHILD_A, STYLE_CHILD_B]);

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

const INTRO_TIME = N1;
const CURVE_ITERATION = LoopCurve.from_timeline(
  new Sequential(
    new Hold(INTRO_TIME),
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
    this.spin = new CNode(CVersor.IDENTITY, VORTEX);

    // The parent iteration is always rendered in a constant color, and
    // the transformations are updated more slowly than for the children.
    this.parent = new StyledTile(this.spin, STYLE_PARENT);

    // animate faning out the shape with the A and B transformations,
    // we then instance this with various prefixes
    this.fan_out = new StyledNode(CVersor.IDENTITY, STYLE_RUNS, this.spin);

    // this will contain either [parent] or [parent, fan_out] depending on
    // where we are in the animation
    this.visible = new CTile(this.parent);

    // The fractal transformations apply to everything visible
    this.fractal_prefixes = new CNode(CVersor.IDENTITY, this.visible);
    this.primitive = new CNode(to_screen, this.fractal_prefixes);
  }

  #current_iteration = 0;
  /**
   * Update the transformations for the current iteration only as needed,
   * not every frame.
   * @param {number} iteration
   */
  #update_iteration(iteration) {
    if (iteration === this.#current_iteration) {
      return;
    }

    this.#current_iteration = iteration;
    const prefixes = PREFIXES[iteration] ?? PREFIXES.at(-1);
    this.fractal_prefixes.update_transforms(...prefixes);
  }

  update(time) {
    // The vortex is always spinning 🌀
    this.spin.update_transforms(spin(time));

    // Update the fractal transformations if needed
    const [iteration, t] = whole_fract(CURVE_ITERATION.value(time));
    this.#update_iteration(iteration);

    // While animating the fractal, update the fan out animation
    if (iteration < MAX_ITERS) {
      const xform_a = dragon_a(t);
      const xform_b = dragon_b(t);
      this.fan_out.update_transforms(xform_a, xform_b);
    }

    // We'll always render the parent transformation, but the
    // fan out animation is not shown in the intro/outtro
    if (time < INTRO_TIME.real || iteration >= MAX_ITERS) {
      this.visible.regroup(this.parent);
    } else if (iteration < MAX_ITERS) {
      this.visible.regroup(this.parent, this.fan_out);
    }
  }
}
