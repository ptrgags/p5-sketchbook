import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { draw_primitive } from "../sketchlib/p5_helpers/draw_primitive.js";
import { DirectionalPad } from "../lab/lablib/DirectionalPad.js";
import { ArcRobot } from "./ArcRobot.js";
import { TouchButton } from "../lab/lablib/TouchButton.js";
import { Rectangle } from "../lab/lablib/Rectangle.js";
import { Point } from "../pga2d/objects.js";
import { CanvasMouseHandler } from "../lab/lablib/CanvasMouseHandler.js";

const MOUSE = new CanvasMouseHandler();
const DPAD = new DirectionalPad();
const HALF_SCREEN = Point.direction(WIDTH / 2, HEIGHT);

// Virtual touch buttons for left and right keys on mobile.
const TOUCH_LEFT = new TouchButton(new Rectangle(Point.ORIGIN, HALF_SCREEN));
const TOUCH_RIGHT = new TouchButton(
  new Rectangle(Point.point(WIDTH / 2, 0), HALF_SCREEN)
);

export const sketch = (p) => {
  let robot = new ArcRobot(5);

  function reset() {
    robot = new ArcRobot(5);
  }

  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;

    MOUSE.setup(canvas);

    DPAD.setup();

    TOUCH_LEFT.events.addEventListener("pressed", () => {
      DPAD.key_pressed("ArrowLeft");
    });
    TOUCH_LEFT.events.addEventListener("released", () => {
      DPAD.key_released("ArrowLeft");
    });
    TOUCH_RIGHT.events.addEventListener("pressed", () => {
      DPAD.key_pressed("ArrowRight");
    });
    TOUCH_RIGHT.events.addEventListener("released", () => {
      DPAD.key_released("ArrowRight");
    });

    document.getElementById("reset").addEventListener("click", reset);
  };

  p.draw = () => {
    p.background(0);

    robot.update(p.frameCount, DPAD.direction.digital);
    const robot_walk = robot.render(p.frameCount);
    draw_primitive(p, robot_walk);
  };

  p.keyPressed = (/** @type {KeyboardEvent} */ e) => {
    const code = e.code;
    DPAD.key_pressed(code);
  };

  p.keyReleased = (/** @type {KeyboardEvent} */ e) => {
    const code = e.code;
    DPAD.key_released(code);
  };

  MOUSE.mouse_pressed(p, (input) => {
    TOUCH_LEFT.mouse_pressed(input.mouse_coords);
    TOUCH_RIGHT.mouse_pressed(input.mouse_coords);
  });

  MOUSE.mouse_moved(p, (input) => {
    TOUCH_LEFT.mouse_moved(input.mouse_coords);
    TOUCH_RIGHT.mouse_moved(input.mouse_coords);
  });

  MOUSE.mouse_released(p, (input) => {
    TOUCH_LEFT.mouse_released(input.mouse_coords);
    TOUCH_RIGHT.mouse_released(input.mouse_coords);
  });

  MOUSE.mouse_dragged(p, (input) => {
    TOUCH_LEFT.mouse_dragged(input.mouse_coords);
    TOUCH_RIGHT.mouse_dragged(input.mouse_coords);
  });
};
