import { Direction } from "../../sketchlib/pga2d/Direction.js";
import { Point } from "../../sketchlib/pga2d/Point.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../sketchlib/primitives/LinePrimitive.js";
import { style } from "../../sketchlib/primitives/shorthand.js";
import { Random } from "../../sketchlib/random.js";
import { Style } from "../../sketchlib/Style.js";
import { Animated } from "../../sketchlib/animation/Animated.js";
import { AnimatedPath } from "../../sketchlib/animation/AnimatedPath.js";
import { LoopCurve } from "../../sketchlib/animation/LoopCurve.js";
import {
  Hold,
  make_param,
  ParamCurve,
} from "../../sketchlib/animation/ParamCurve.js";
import { Sequential } from "../../sketchlib/music/Timeline.js";
import { Rational } from "../../sketchlib/Rational.js";
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
  VERTICAL_PATHS.push(column_stitches);
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
  HORIZONTAL_PATHS.push(row_stitches);
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

const ALL_PATHS = [...interleave(HORIZONTAL_PATHS, VERTICAL_PATHS)].flat();
const STITCH_PATH = new AnimatedPath(ALL_PATHS, 0, 1);

const STITCH_DURATION = new Rational(8);
const UNSTITCH_DURATION = new Rational(4);

// from [0, 1] these control the path start/end for the stitching animation
// from [1, 2] these control the path start/end for the unstitching animation
const CURVE_START = LoopCurve.from_timeline(
  new Sequential(
    new Hold(STITCH_DURATION),
    make_param(0, 1, UNSTITCH_DURATION),
  ),
);
const CURVE_END = LoopCurve.from_timeline(
  new Sequential(
    make_param(0, 1, STITCH_DURATION),
    new Hold(UNSTITCH_DURATION),
  ),
);

const STYLE_STITCHES = new Style({
  stroke: PALETTE_CORAL[Values.MEDIUM],
  width: 4,
});

/**
 * @implements {Animated}
 */
class Hitomezashi {
  constructor() {
    this.primitive = style(GroupPrimitive.EMPTY, STYLE_STITCHES);
  }

  update(time) {
    const primitive = this.primitive;
    primitive.primitives.length = 0;

    // For the stitch animation we animate    [0, end-->
    // for the unstitch animation we animate  start-->, end]
    // so we need two curves, one per variable
    const start = CURVE_START.value(time);
    const end = CURVE_END.value(time);

    this.start = start;
    this.end = end;

    // Use render_between to slice out a portion of the path
    const prim = STITCH_PATH.render_between(start, end);
    primitive.primitives.push(prim);
  }
}

export const HITOMEZASHI = new Hitomezashi();
