import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";

// @ts-ignore
export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
    p.pixelDensity(1);
  };

  p.draw = () => {
    p.background(0);
  };
};
