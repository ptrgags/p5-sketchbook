import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { DragonCurveAnimation } from "./DragonCurveAnimation.js";

const ANIMATION = DragonCurveAnimation(CVersor.IDENTITY);

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
  };
};
