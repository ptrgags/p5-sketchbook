import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { DancingArrow } from "./DancingArrow.js";
import { ParabolicGridIllusion } from "./ParabolicGridIllusion.js";
import { TranslationGridIllusion } from "./TranslationGridIllusion.js";
import { MouseInCanvas } from "../sketchlib/input/MouseInput.js";
import { SelectAnimated } from "../sketchlib/animation/SelectAnimated.js";

const TO_SCREEN = CVersor.to_screen(new Circle(SCREEN_CENTER, 200));
const MOUSE = new CanvasMouseHandler();

const GRIDS = new SelectAnimated([
  new ParabolicGridIllusion(TO_SCREEN),
  new TranslationGridIllusion(TO_SCREEN),
]);

const ARROW = new DancingArrow(new Circle(SCREEN_CENTER, 20));

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

    const time_sec = p.frameCount / 60;
    const SEC_PER_MIN = 60;
    const BPM = 128;
    const BEATS_PER_MEASURE = 4;
    const time_measures = ((time_sec / SEC_PER_MIN) * BPM) / BEATS_PER_MEASURE;

    GRIDS.update(time_measures);
    GRIDS.primitive.draw(p);

    ARROW.update(time_measures);
    ARROW.primitive.draw(p);
  };

  // Swap the animations on mouse click.
  MOUSE.mouse_released(p, (input) => {
    if (input.in_canvas !== MouseInCanvas.IN_CANVAS) {
      return;
    }

    GRIDS.next();
  });
};
