import { Clock } from "../sketchlib/animation/Clock.js";
import { SelectAnimated } from "../sketchlib/animation/SelectAnimated.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { Tempo } from "../sketchlib/music/Tempo.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { ExpandCollapseParallels } from "./ExpandCollapseParallels.js";
import { GlobeRotation } from "./GlobeRotation.js";
import { ScaleParallels } from "./ScaleParallels.js";

const TO_SCREEN = CVersor.to_screen(new Circle(SCREEN_CENTER, 200));

const SCALE_FACTOR = 2;
const MAX_POWER = 5;
const ANIMATIONS = new SelectAnimated([
  new GlobeRotation(TO_SCREEN),
  new ExpandCollapseParallels(SCALE_FACTOR, MAX_POWER, TO_SCREEN),
  new ScaleParallels(SCALE_FACTOR, MAX_POWER, TO_SCREEN),
]);

const MOUSE = new CanvasMouseHandler();
const CLOCK = new Clock();

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

    const t = Tempo.sec_to_measures(CLOCK.elapsed_time, 128);

    ANIMATIONS.update(t);
    ANIMATIONS.primitive.draw(p);
  };

  MOUSE.mouse_released(p, () => {
    /*
    ANIMATIONS.next();
    CLOCK.reset();
    */
  });
};
