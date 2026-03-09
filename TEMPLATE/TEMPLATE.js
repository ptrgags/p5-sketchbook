import { configure_sketch } from "../sketchlib/configure_sketch.js";

export const sketch = (p) => {
  p.setup = () => {
    configure_sketch(p);
  };

  p.draw = () => {
    p.background(0);
  };
};
