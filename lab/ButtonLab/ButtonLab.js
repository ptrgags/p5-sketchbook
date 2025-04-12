import { Point } from "../../pga2d/objects.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../../sketchlib/dimensions.js";
import { to_y_down } from "../../sketchlib/Direction.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { CirclePrimitive, GroupPrimitive } from "../../sketchlib/primitives.js";
import { Color, Style } from "../../sketchlib/Style.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { TouchDPad } from "../lablib/TouchDPad.js";
import { Rectangle } from "../lablib/Rectangle.js";
import { ButtonState, TouchButton } from "../lablib/TouchButton.js";
import { ToggleButton } from "../lablib/ToggleButton.js";

const MOUSE = new CanvasMouseHandler();
const DPAD = new TouchDPad(
  new Rectangle(Point.point(10, 10), Point.direction(200, 200)),
  0.01
);
const BUTTON = new TouchButton(
  new Rectangle(Point.point(350, 50), Point.direction(100, 100))
);

const TOGGLE = new ToggleButton(
  new Rectangle(Point.point(10, 300), Point.direction(100, 100)),
  false
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

    MOUSE.setup(canvas);
  };

  function move_circle() {
    const direction = to_y_down(DPAD.direction.digital);
    position = position.add(direction.scale(SPEED));
  }

  p.draw = () => {
    p.background(0);

    move_circle();

    const style =
      BUTTON.state === ButtonState.PRESSED
        ? Style.DEFAULT_STROKE.with_fill(Color.BLUE)
        : Style.DEFAULT_STROKE_FILL;

    const circle = new CirclePrimitive(position, 20);
    const circle_group = new GroupPrimitive([circle], style);
    const dpad = DPAD.render();
    const button = BUTTON.debug_render();
    const toggle = TOGGLE.debug_render();

    const scene = new GroupPrimitive([circle_group, dpad, button, toggle]);
    draw_primitive(p, scene);
  };

  MOUSE.mouse_pressed(p, (input) => {
    DPAD.mouse_pressed(input.mouse_coords);
    BUTTON.mouse_pressed(input.mouse_coords);
    TOGGLE.mouse_pressed(input.mouse_coords);
  });

  MOUSE.mouse_moved(p, (input) => {
    BUTTON.mouse_moved(input.mouse_coords);
    TOGGLE.mouse_moved(input.mouse_coords);
  });

  MOUSE.mouse_released(p, (input) => {
    // Even if the mouse is off the canvas, release the DPAD input
    DPAD.mouse_released();
    BUTTON.mouse_released(input.mouse_coords);
    TOGGLE.mouse_released(input.mouse_coords);
  });

  MOUSE.mouse_dragged(p, (input) => {
    DPAD.mouse_dragged(input);
    BUTTON.mouse_dragged(input.mouse_coords);
    TOGGLE.mouse_dragged(input.mouse_coords);
  });
};
