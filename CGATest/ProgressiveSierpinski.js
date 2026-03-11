import { Animated } from "../sketchlib/animation/Animated.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { Color } from "../sketchlib/Color.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { ProgressivePrimitive } from "../sketchlib/primitives/ProgressivePrimitive.js";
import { style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { MAX_ITERS } from "./AnimatedSierpinski.js";

const SHRINK = CVersor.dilation(0.5);
const SIERPINSKI_IFS = new IFS([
  CVersor.translation(new Direction(-0.5, 0.5)).compose(SHRINK),
  CVersor.translation(new Direction(0.5, 0.5)).compose(SHRINK),
  CVersor.translation(new Direction(0, -0.5)).compose(SHRINK),
]);

const STYLE_CIRCLES = new Style({
  stroke: Color.GREEN,
});

/**
 * @implements {Animated}
 */
export class ProgressiveSierpinski {
  /**
   *
   * @param {CVersor} to_screen
   */
  constructor(to_screen) {
    this.progress = new ProgressivePrimitive(
      SIERPINSKI_IFS.iterate(6).map((xform) => {
        return to_screen.compose(xform).transform(Cline.UNIT_CIRCLE);
      }),
      1,
    );

    this.primitive = style(this.progress, STYLE_CIRCLES);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    // delay the start of the animation until the sierpinski triangle reaches
    // the max depth
    const time_from_sierpinski = Math.max(time - MAX_ITERS, 0);

    // the animation is too slow, go faster
    const t = 32 * time_from_sierpinski;
    this.progress.update(t);
  }
}
