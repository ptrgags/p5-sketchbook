import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { Clock } from "./Clock.js";

const CLOCK = new Clock();

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );
  };

  p.draw = () => {
    p.background(0);

    CLOCK.update();

    draw_primitive(p, CLOCK.render());
  };
};
