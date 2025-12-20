import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";
import { Point } from "../pga2d/objects.js";
import { AnimatedWorm } from "./AnimatedWorm.js";
import { prevent_mobile_scroll } from "../sketchlib/prevent_mobile_scroll.js";

const INITIAL_POSITION = new Point(WIDTH / 2, HEIGHT - 50);

const WORM = new AnimatedWorm(INITIAL_POSITION);

export const sketch = (p) => {
  let canvas;
  let mouse = INITIAL_POSITION;
  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;
    prevent_mobile_scroll(canvas);
  };

  p.draw = () => {
    p.background(0);

    WORM.move_nose_towards(mouse);

    WORM.render().draw(p);
  };

  p.mouseMoved = () => {
    mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
  };

  p.mouseDragged = p.mouseMoved;
};
