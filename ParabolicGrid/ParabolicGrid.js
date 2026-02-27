import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { ParabolicGridAnimation } from "./ParabolicGridAnimation.js";

const TRANSLATE_CENTER = CVersor.translation(SCREEN_CENTER.to_direction());
const SCALE_UP = CVersor.dilation(200);
const FLIP_Y = CVersor.reflection(Direction.DIR_Y);
const TO_SCREEN = TRANSLATE_CENTER.compose(SCALE_UP).compose(FLIP_Y);

export const sketch = (p) => {
  const grid = new ParabolicGridAnimation(TO_SCREEN);

  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );
  };

  p.draw = () => {
    p.background(0);

    const time_sec = p.frameCount / 60;
    const SEC_PER_MIN = 60;
    const BPM = 128;
    const BEATS_PER_MEASURE = 4;
    const time_measures = ((time_sec / SEC_PER_MIN) * BPM) / BEATS_PER_MEASURE;
    grid.update(time_measures);

    grid.primitive.draw(p);
  };
};
