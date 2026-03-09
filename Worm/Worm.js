import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";
import { AnimatedWorm } from "./AnimatedWorm.js";
import { prevent_mobile_scroll } from "../sketchlib/prevent_mobile_scroll.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { configure_sketch } from "../sketchlib/configure_sketch.js";

const INITIAL_POSITION = new Point(WIDTH / 2, HEIGHT - 50);

const WORM = new AnimatedWorm(INITIAL_POSITION);

export const sketch = (p) => {
  let mouse = INITIAL_POSITION;
  p.setup = () => {
    configure_sketch(p);
    prevent_mobile_scroll(p.canvas);
  };

  p.draw = () => {
    p.background(0);

    WORM.move_nose_towards(mouse);

    WORM.render().draw(p);
  };

  p.mouseMoved = () => {
    mouse = fix_mouse_coords(p.canvas, p.mouseX, p.mouseY);
  };

  p.mouseDragged = p.mouseMoved;
};
