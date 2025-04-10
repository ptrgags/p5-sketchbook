import { Point } from "../../pga2d/objects.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { fix_mouse_coords } from "../../sketchlib/fix_mouse_coords.js";
import { DirectionalPad } from "../lablib/DirectionalPad.js";
import { Rectangle, SCREEN_RECT } from "../lablib/Rectangle.js";

const DPAD = new DirectionalPad(
  new Rectangle(Point.point(10, 10), Point.direction(200, 400)),
  0.01
);

export const sketch = (p) => {
  let canvas;
  p.setup = () => {
    canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;
  };

  p.draw = () => {
    p.background(0);

    draw_primitive(p, DPAD.render());
  };

  p.mousePressed = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    if (!SCREEN_RECT.contains(mouse)) {
      return;
    }

    DPAD.mouse_pressed(mouse);
  };

  p.mouseDragged = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    if (!SCREEN_RECT.contains(mouse)) {
      return;
    }

    DPAD.mouse_dragged(mouse);
  };

  p.mouseReleased = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    if (!SCREEN_RECT.contains(mouse)) {
      return;
    }

    DPAD.mouse_released();
  };
};
