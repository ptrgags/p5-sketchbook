import { Clock } from "../sketchlib/animation/Clock.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Tempo } from "../sketchlib/music/Tempo.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { DragonCurveAnimation } from "./DragonCurveAnimation.js";

const TO_SCREEN = CVersor.to_screen(new Circle(SCREEN_CENTER, 150));
const ANIMATION = new DragonCurveAnimation(TO_SCREEN);
const CLOCK = new Clock();

export const sketch = (p) => {
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

    const time = Tempo.sec_to_measures(CLOCK.elapsed_time, 128);
    ANIMATION.update(time);

    ANIMATION.primitive.draw(p);
  };
};
