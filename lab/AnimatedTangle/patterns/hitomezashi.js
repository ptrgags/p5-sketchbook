import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../../sketchlib/primitives/LinePrimitive.js";
import { style } from "../../../sketchlib/primitives/shorthand.js";
import { Random } from "../../../sketchlib/random.js";
import { Style } from "../../../sketchlib/Style.js";
import { AnimatedPath } from "../../lablib/animation/AnimatedPath.js";
import { AnimationCurve } from "../../lablib/animation/AnimationCurve.js";
import { LoopCurve } from "../../lablib/animation/LoopCurve.js";
import { Hold, ParamCurve } from "../../lablib/animation/ParamCurve.js";
import { Sequential } from "../../lablib/music/Timeline.js";
import { Rational } from "../../lablib/Rational.js";
import { PALETTE_CORAL, Values } from "../theme_colors.js";

const SPACING = 25;
const SQUARES = 8;
const NUM_COLS = SQUARES + 1;
const NUM_ROWS = NUM_COLS;

const BITS = [0, 1];
const X_BITS = new Array(NUM_COLS).fill(0).map(() => Random.rand_choice(BITS));
const Y_BITS = new Array(NUM_ROWS).fill(0).map(() => Random.rand_choice(BITS));

const PADDING = 5;
const ORIGIN = new Point(300 - PADDING, 300 - PADDING);
const X_STEP = new Direction(-SPACING, 0);
const Y_STEP = new Direction(0, -SPACING);

const VERTICAL_PATHS = [];
for (let i = 0; i < NUM_COLS; i++) {
  const start = X_BITS[i];
  const column_origin = ORIGIN.add(X_STEP.scale(i));
  const column_stitches = [];
  for (let j = start; j < NUM_ROWS; j += 2) {
    const a = column_origin.add(Y_STEP.scale(j));
    const b = column_origin.add(Y_STEP.scale(j + 1));

    const stitch = new LinePrimitive(a, b);
    column_stitches.push(stitch);
  }
  VERTICAL_PATHS.push(new AnimatedPath(column_stitches, 0, 1));
}

const HORIZONTAL_PATHS = [];
for (let i = 0; i < NUM_ROWS; i++) {
  const start = Y_BITS[i];
  const row_origin = ORIGIN.add(Y_STEP.scale(i));
  const row_stitches = [];
  for (let j = start; j < NUM_COLS; j += 2) {
    const a = row_origin.add(X_STEP.scale(j));
    const b = row_origin.add(X_STEP.scale(j + 1));

    const stitch = new LinePrimitive(a, b);
    row_stitches.push(stitch);
  }
  HORIZONTAL_PATHS.push(new AnimatedPath(row_stitches, 0, 1));
}

/**
 * @template T
 * @param {Array<T>} arr_a First array
 * @param {Array<T>} arr_b Second array of same type and length
 * @returns {Generator<T>} Generator of the elements interleaved
 */
function* interleave(arr_a, arr_b) {
  for (let i = 0; i < arr_a.length; i++) {
    yield arr_a[i];
    yield arr_b[i];
  }
}

const ALL_PATHS = [...interleave(HORIZONTAL_PATHS, VERTICAL_PATHS)];

const DURATION_STITCH = 1;
const PHASES = new Array(ALL_PATHS.length)
  .fill(0)
  .map((_, i) => -i * DURATION_STITCH);
console.log(PHASES);

// from [0, 1] these control the path start/end for the stitching animation
// from [1, 2] these control the path start/end for the unstitching animation
const TIMELINE_START = new Sequential(
  new Hold(Rational.ONE),
  new ParamCurve(0, 1, Rational.ONE)
);
const TIMELINE_END = new Sequential(
  new ParamCurve(0, 1, Rational.ONE),
  new Hold(Rational.ONE)
);
const CURVE_START = AnimationCurve.from_timeline(TIMELINE_START);
const CURVE_END = AnimationCurve.from_timeline(TIMELINE_END);

const DURATION_PAUSE = 1;

// Wait for the other curves to finish animating, plus a little pause
const WAIT = new Hold(
  new Rational((ALL_PATHS.length - 1) * DURATION_STITCH + DURATION_PAUSE)
);
const TIMELINE_TIMING = new Sequential(
  new ParamCurve(0, 1, new Rational(DURATION_STITCH)),
  WAIT,
  new ParamCurve(1, 2, new Rational(DURATION_STITCH)),
  WAIT
);
const CURVE_TIMING = new LoopCurve(
  AnimationCurve.from_timeline(TIMELINE_TIMING)
);

const STYLE_STITCHES = new Style({
  stroke: PALETTE_CORAL[Values.Medium].to_srgb(),
  width: 2,
});

class Hitomezashi {
  constructor() {
    this.primitive = style(GroupPrimitive.EMPTY, STYLE_STITCHES);
  }

  update(time) {
    const primitive = this.primitive;
    primitive.primitives.length = 0;

    for (let i = 0; i < ALL_PATHS.length; i++) {
      // First use the timing curve to determine which part of the animation
      // we're at.
      const anim_t = CURVE_TIMING.value(time + PHASES[i]);

      // For the stitch animation we animate    [0, end-->
      // for the unstitch animation we animate  start-->, end]
      // so we need two curves, one per variable
      const start = CURVE_START.value(anim_t);
      const end = CURVE_END.value(anim_t);

      // Use render_between to slice out a portion of the path
      const prim = ALL_PATHS[i].render_between(start, end);
      primitive.primitives.push(prim);
    }
  }

  render() {
    return this.primitive;
  }
}

export const HITOMEZASHI = new Hitomezashi();
