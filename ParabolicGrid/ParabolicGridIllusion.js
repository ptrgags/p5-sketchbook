import { Animated } from "../sketchlib/animation/Animated.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { STYLE_X, STYLE_Y } from "./styling.js";
import { CURVE_X, CURVE_Y } from "./timing.js";

const OFFSET_X = Direction.DIR_X;
const OFFSET_Y = Direction.DIR_Y;

const MAX_STEP = 13;
const X_TILES = [];
const Y_TILES = [];
for (let i = -MAX_STEP; i <= MAX_STEP; i++) {
  const transform_x = CVersor.parabolic(OFFSET_X.scale(i));
  const transform_y = CVersor.parabolic(OFFSET_Y.scale(i));
  X_TILES.push(transform_x.transform_cline(Cline.Y_AXIS));
  Y_TILES.push(transform_y.transform_cline(Cline.X_AXIS));
}

/**
 * Animation of the flow of two parabolic transformations in orthogonal transformations.
 *
 * This operates by illusion, making use of two properties of this grid:
 * - The grid is periodic. E.g. in the x direction
 *   grid_line[i + 1] = parabolic * grid_line[i] for all integer i
 *   and similarly for y
 * - The pixels near the pole get completely covered after just a few
 *   iterations of parabolic. So we don't have to render the countable infinity of grid lines,
 *   just the ~20-30 most visible ones
 *
 * To do this, we precompute the grid lines once. Then we only need
 * to animate lerp(identity, parabolic, t), t in [0, 1]. This allows the grid lines
 * to flow between grid_lines[i] and grid_lines[i + 1], landing exactly on the next grid line
 * when t = 1.
 *
 * Then we jump back to t = 0. For the majority of the grid lines, we're jumping exactly from
 * grid line to grid line, so the jump is not noticeable! The only exception are the
 * grid lines at the end of the iteration. But both of those are near the pole. Since the pixels
 * get crowded there, you won't see any visual change!
 *
 * @implements {Animated}
 */
export class ParabolicGridIllusion {
  /**
   * Constructor
   * @param {CVersor} to_screen Transformation from the unit circle to a larger screen space circle
   */
  constructor(to_screen) {
    this.to_screen = to_screen;

    this.x_group = style(X_TILES, STYLE_X);
    this.y_group = style(Y_TILES, STYLE_Y);
    this.primitive = group(this.x_group, this.y_group);
  }

  /**
   * Update the animation
   * @param {number} time
   */
  update(time) {
    const tx = CURVE_X.value(time);
    const ty = CURVE_Y.value(time);
    const para_x = CVersor.parabolic(OFFSET_X.scale(tx));
    const para_y = CVersor.parabolic(OFFSET_Y.scale(ty));
    const para_total = para_x.compose(para_y);
    const para_screen = this.to_screen.compose(para_total);

    const x_tiles = X_TILES.map((x) => para_screen.transform_cline(x));
    const y_tiles = Y_TILES.map((x) => para_screen.transform_cline(x));
    this.x_group.primitives = x_tiles;
    this.y_group.primitives = y_tiles;
  }
}
