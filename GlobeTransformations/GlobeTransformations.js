import { SelectAnimated } from "../sketchlib/animation/SelectAnimated.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { ExpandCollapseParallels } from "./ExpandCollapseParallels.js";
import { ScaleParallels } from "./ScaleParallels.js";

// Map the unit circle to a circle at the center of the screen with radius 200 px
// Anything I want to render on the unit circle needs to be conjugated by this.
const TRANSLATE_CIRCLE_CENTER = CVersor.translation(
  new Direction(WIDTH / 2, HEIGHT / 2),
);
const SCALE_UP = CVersor.dilation(200);
const FLIP_Y = CVersor.reflection(Direction.DIR_Y);
const TO_SCREEN = TRANSLATE_CIRCLE_CENTER.compose(SCALE_UP).compose(FLIP_Y);

const SCALE_FACTOR = 2;
const MAX_POWER = 5;
const ANIMATIONS = new SelectAnimated([
  new ExpandCollapseParallels(SCALE_FACTOR, MAX_POWER, TO_SCREEN),
  new ScaleParallels(SCALE_FACTOR, MAX_POWER, TO_SCREEN),
]);

const MOUSE = new CanvasMouseHandler();

export const sketch = (p) => {
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    ).elt;

    MOUSE.setup(canvas);
  };

  p.draw = () => {
    p.background(0);

    const t = p.frameCount / 60;

    ANIMATIONS.update(t);
    ANIMATIONS.primitive.draw(p);
  };

  MOUSE.mouse_released(p, () => {
    ANIMATIONS.next();
  });
};
