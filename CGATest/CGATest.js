import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { AnimatedSierpinski } from "./AnimatedSierpinski.js";
import { SelectAnimated } from "../sketchlib/animation/SelectAnimated.js";
import { CGA_BASICS } from "./cga_basics.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { MouseInCanvas } from "../sketchlib/input/MouseInput.js";
import { AnimationGroup } from "../sketchlib/animation/AnimationGroup.js";
import { Clock } from "../sketchlib/animation/Clock.js";
import { ConformalXformTest } from "./ConformalXformTest.js";
import { NachoSpaceship } from "./NachoSpaceship.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { ProgressiveSierpinski } from "./ProgressiveSierpinski.js";
import { Tempo } from "../sketchlib/music/Tempo.js";
import { Circle } from "../sketchlib/primitives/Circle.js";

const TO_SCREEN = CVersor.to_screen(new Circle(SCREEN_CENTER, 200));

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

    const t_seconds = CLOCK.elapsed_time;
    const t_measures = Tempo.sec_to_measures(t_seconds, BPM);

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
