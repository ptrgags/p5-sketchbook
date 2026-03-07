import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { ProgressivePrimitive } from "../sketchlib/primitives/ProgressivePrimitive.js";
import { TO_SCREEN } from "./common.js";

const SHRINK = CVersor.dilation(0.5);
const SIERPINSKI_IFS = new IFS([
  CVersor.translation(new Direction(-0.5, 0.5)).compose(SHRINK),
  CVersor.translation(new Direction(0.5, 0.5)).compose(SHRINK),
  CVersor.translation(new Direction(0, -0.5)).compose(SHRINK),
]);

// okay we need to scale the time a bit...
//const slice_t = Math.max((p.frameCount - 60 * 5) / 4, 0);

export const SIERPINSKI_TILES = new ProgressivePrimitive(
  SIERPINSKI_IFS.iterate(6).map((xform) => {
    return TO_SCREEN.compose(xform).transform(Cline.UNIT_CIRCLE);
  }),
  1,
);
