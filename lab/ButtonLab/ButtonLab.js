import { Point } from "../../pga2d/objects.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../../sketchlib/dimensions.js";
import { to_y_down } from "../../sketchlib/Direction.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { CirclePrimitive, GroupPrimitive } from "../../sketchlib/primitives.js";
import { Style } from "../../sketchlib/Style.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { TouchDPad } from "../lablib/TouchDPad.js";
import { Rectangle } from "../lablib/Rectangle.js";

const MOUSE = new CanvasMouseHandler();
const DPAD = new TouchDPad(
  new Rectangle(Point.point(10, 10), Point.direction(200, 200)),
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

    MOUSE.setup(canvas);
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

  MOUSE.mouse_pressed(p, (input) => {
    DPAD.mouse_pressed(input.mouse_coords);
  });

  p.mouseReleased = () => {
    // Even if the mouse is off the canvas, release the DPAD input
    DPAD.mouse_released();
  };

  MOUSE.mouse_dragged(p, (input) => {
    DPAD.mouse_dragged(input);
  });
};
