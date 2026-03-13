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

export class ProgressiveSierpinski {
  /**
   * Constructor
   * @param {CVersor} to_screen Transformation from the unit circle to where it will appear on the screen.
   */
  constructor(to_screen) {
    // Unlike other CGA animations, this one computes all the geometry once
    // up front and passes the primitives to ProgressivePrimitive
    const sierpinski_circles = SIERPINSKI_IFS.iterate(6).map((xform) => {
      return to_screen.compose(xform).transform(Cline.UNIT_CIRCLE);
    });
    this.progress = new ProgressivePrimitive(sierpinski_circles, 1);

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
