import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { AnimatedSierpinski } from "./AnimatedSierpinski.js";
import { SelectAnimated } from "../sketchlib/animation/SelectAnimated.js";
import { CGA_BASICS } from "./cga_basics.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { MouseInCanvas } from "../sketchlib/input/MouseInput.js";
import { TO_SCREEN } from "./common.js";
import { AnimationGroup } from "../sketchlib/animation/AnimationGroup.js";
import { SIERPINSKI_TILES } from "./progressive_sierpinski.js";
import { Clock } from "./Clock.js";
import { ConformalXformTest } from "./ConformalXformTest.js";

const ANIMATIONS = new SelectAnimated([
  CGA_BASICS,
  new ConformalXformTest(TO_SCREEN),
  new AnimationGroup(SIERPINSKI_TILES, new AnimatedSierpinski(TO_SCREEN)),
]);

const MOUSE = new CanvasMouseHandler();

const CLOCK = new Clock();
const BPM = 128;

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
