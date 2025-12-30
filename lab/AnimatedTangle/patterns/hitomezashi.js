import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../../sketchlib/primitives/LinePrimitive.js";
import { style } from "../../../sketchlib/primitives/shorthand.js";
import { Random } from "../../../sketchlib/random.js";
import { Style } from "../../../sketchlib/Style.js";
import { PALETTE_CORAL, Values } from "../theme_colors.js";

const SPACING = 25;
const SQUARES = 8;
const NUM_COLS = SQUARES + 1;
const NUM_ROWS = NUM_COLS;

const BITS = [0, 1];
const X_BITS = new Array(NUM_COLS).fill(0).map(() => Random.rand_choice(BITS));
const Y_BITS = new Array(NUM_ROWS).fill(0).map(() => Random.rand_choice(BITS));

const ORIGIN = new Point(300, 300);
const X_STEP = new Direction(-SPACING, 0);
const Y_STEP = new Direction(0, -SPACING);

const STYLE_STITCHES = new Style({
  stroke: PALETTE_CORAL[Values.Medium].to_srgb(),
  width: 2,
});

class Hitomezashi {
  constructor() {
    // vertical stitches
    const vertical_stitches = [];
    for (let i = 0; i < NUM_COLS; i++) {
      const start = X_BITS[i];
      const column_origin = ORIGIN.add(X_STEP.scale(i));
      for (let j = start; j < NUM_ROWS; j += 2) {
        const a = column_origin.add(Y_STEP.scale(j));
        const b = column_origin.add(Y_STEP.scale(j + 1));

        const stitch = new LinePrimitive(a, b);
        vertical_stitches.push(stitch);
      }
    }

    const horizontal_stitches = [];
    for (let i = 0; i < NUM_ROWS; i++) {
      const start = Y_BITS[i];
      const row_origin = ORIGIN.add(Y_STEP.scale(i));
      for (let j = start; j < NUM_COLS; j += 2) {
        const a = row_origin.add(X_STEP.scale(j));
        const b = row_origin.add(X_STEP.scale(j + 1));

        const stitch = new LinePrimitive(a, b);
        horizontal_stitches.push(stitch);
      }
    }

    this.primitive = style(
      [...vertical_stitches, ...horizontal_stitches],
      STYLE_STITCHES
    );
  }

  render() {
    return this.primitive;
  }
}

export const HITOMEZASHI = new Hitomezashi();
