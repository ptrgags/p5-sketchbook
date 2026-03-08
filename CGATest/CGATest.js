import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { AnimatedSierpinski } from "./AnimatedSierpinski.js";
import { SelectAnimated } from "../sketchlib/animation/SelectAnimated.js";
import { CGA_BASICS } from "./cga_basics.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { MouseInCanvas } from "../sketchlib/input/MouseInput.js";
import { AnimationGroup } from "../sketchlib/animation/AnimationGroup.js";
import { Clock } from "./Clock.js";
import { ConformalXformTest } from "./ConformalXformTest.js";
import { NachoSpaceship } from "./NachoSpaceship.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { ProgressiveSierpinski } from "./ProgressiveSierpinski.js";
import { configure_sketch } from "../sketchlib/configure_sketch.js";

// Map the unit circle to a circle at the center of the screen with radius 200 px
// Anything I want to render on the unit circle needs to be conjugated by this.
const TRANSLATE_CIRCLE_CENTER = CVersor.translation(
  new Direction(WIDTH / 2, HEIGHT / 2),
);
const SCALE_UP = CVersor.dilation(200);
const FLIP_Y = CVersor.reflection(Direction.DIR_Y);
const TO_SCREEN = TRANSLATE_CIRCLE_CENTER.compose(SCALE_UP).compose(FLIP_Y);

const ANIMATIONS = new SelectAnimated([
  CGA_BASICS,
  new ConformalXformTest(TO_SCREEN),
  new AnimationGroup(
    new ProgressiveSierpinski(TO_SCREEN),
    new AnimatedSierpinski(TO_SCREEN),
  ),
  new NachoSpaceship(TO_SCREEN),
]);

const MOUSE = new CanvasMouseHandler();

const CLOCK = new Clock();
const BPM = 128;

export const sketch = (p) => {
  p.setup = () => {
    configure_sketch(p);
    MOUSE.setup(p.canvas);
  };

  p.draw = () => {
    p.background(0);

    const t_measures = CLOCK.get_elapsed_measures(BPM);

    ANIMATIONS.update(t_measures);
    ANIMATIONS.primitive.draw(p);
  };

  MOUSE.mouse_released(p, (input) => {
    if (input.in_canvas !== MouseInCanvas.IN_CANVAS) {
      return;
    }

    ANIMATIONS.next();
    CLOCK.reset();
  });
};
