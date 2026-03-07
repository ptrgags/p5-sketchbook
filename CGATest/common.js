import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";

// Map the unit circle to a circle at the center of the screen with radius 200 px
// Anything I want to render on the unit circle needs to be conjugated by this.
const TRANSLATE_CIRCLE_CENTER = CVersor.translation(
  new Direction(WIDTH / 2, HEIGHT / 2),
);
const SCALE_UP = CVersor.dilation(200);
const FLIP_Y = CVersor.reflection(Direction.DIR_Y);
export const TO_SCREEN =
  TRANSLATE_CIRCLE_CENTER.compose(SCALE_UP).compose(FLIP_Y);

export const BIG_UNIT_CIRCLE = TO_SCREEN.transform(Cline.UNIT_CIRCLE);
