import { CanvasMouseHandler } from "../sketchlib/CanvasMouseHandler.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { SCREEN_RECT } from "../sketchlib/Rectangle.js";
import { DancingArrow } from "./DancingArrow.js";
import { ParabolicGridIllusion } from "./ParabolicGridIllusion.js";
import { TranslationGridIllusion } from "./TranslationGridIllusion.js";

const TRANSLATE_CENTER = CVersor.translation(SCREEN_CENTER.to_direction());
const SCALE_UP = CVersor.dilation(200);
const FLIP_Y = CVersor.reflection(Direction.DIR_Y);
const TO_SCREEN = TRANSLATE_CENTER.compose(SCALE_UP).compose(FLIP_Y);

const MOUSE = new CanvasMouseHandler();

const GRIDS = [
  new ParabolicGridIllusion(TO_SCREEN),
  new TranslationGridIllusion(TO_SCREEN),
];

const ARROW = new DancingArrow(new Circle(SCREEN_CENTER, 16));

export const sketch = (p) => {
  let selected_index = 0;

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

    const grid = GRIDS[selected_index];
    grid.update(time_measures);
    grid.primitive.draw(p);

    ARROW.update(time_measures);
    ARROW.primitive.draw(p);
  };

  // Swap the animations on mouse click.
  MOUSE.mouse_released(p, (input) => {
    if (!SCREEN_RECT.contains(input.mouse_coords)) {
      return;
    }

    selected_index++;
    selected_index %= GRIDS.length;
  });
};
