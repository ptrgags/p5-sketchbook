import { Point } from "../../pga2d/objects.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../../sketchlib/dimensions.js";
import { to_y_down } from "../../sketchlib/Direction.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { fix_mouse_coords } from "../../sketchlib/fix_mouse_coords.js";
import { prevent_mobile_scroll } from "../../sketchlib/prevent_mobile_scroll.js";
import { CirclePrimitive, GroupPrimitive } from "../../sketchlib/primitives.js";
import { Style } from "../../sketchlib/Style.js";
import {
  mouse_dragged,
  mouse_pressed,
  mouse_released,
} from "../lablib/better_mouse_events.js";
import { DirectionalPad } from "../lablib/DirectionalPad.js";
import { Rectangle, SCREEN_RECT } from "../lablib/Rectangle.js";

const DPAD = new DirectionalPad(
  new Rectangle(Point.point(-2, 10), Point.direction(200, 200)),
  0.01
);

const SPEED = 4;

export const sketch = (p) => {
  let canvas;

  let position = SCREEN_CENTER;

  p.setup = () => {
    canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;

    prevent_mobile_scroll(canvas);
  };

  function move_circle() {
    if (DPAD.direction_pressed !== undefined) {
      const direction = to_y_down(DPAD.direction_pressed);
      position = position.add(direction.scale(SPEED));
    }
  }

  p.draw = () => {
    p.background(0);

    move_circle();

    const circle = new CirclePrimitive(position, 20);
    const circle_group = new GroupPrimitive(
      [circle],
      Style.DEFAULT_STROKE_FILL
    );
    const dpad = DPAD.render();

    const scene = new GroupPrimitive([circle_group, dpad]);
    draw_primitive(p, scene);
  };

  mouse_pressed(p, canvas, (input) => {
    DPAD.mouse_pressed(input.mouse_coords);
  });

  /*
  mouse_dragged(p, canvas, (input) => {
    DPAD.mouse_dragged(input);
  });

  p.mouseReleased = () => {
    // Even if the mouse is off the canvas, release the DPAD input
    DPAD.mouse_released();
  };
  */

  /*
  p.mousePressed = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    if (!SCREEN_RECT.contains(mouse)) {
      return;
    }

    DPAD.mouse_pressed(mouse);
  };*/

  /*
  p.mouseDragged = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    if (!SCREEN_RECT.contains(mouse)) {
      return;
    }

    DPAD.mouse_dragged(mouse);
  };
  */
};
