import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { DirectionalPad } from "../sketchlib/DirectionalPad.js";
import { ArcRobot, N_VALUES } from "./ArcRobot.js";
import { TouchButton } from "../sketchlib/TouchButton.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { CanvasMouseHandler } from "../sketchlib/CanvasMouseHandler.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";

const MOUSE = new CanvasMouseHandler();
const DPAD = new DirectionalPad();
const HALF_SCREEN = new Direction(WIDTH / 2, HEIGHT);

// Virtual touch buttons for left and right keys on mobile.
const TOUCH_LEFT = new TouchButton(new Rectangle(Point.ORIGIN, HALF_SCREEN));
const TOUCH_RIGHT = new TouchButton(
  new Rectangle(new Point(WIDTH / 2, 0), HALF_SCREEN),
);

export const sketch = (p) => {
  let n = 5;
  let robot = new ArcRobot(n);

  function reset() {
    robot = new ArcRobot(n);
  }

  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
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

    for (const x of N_VALUES) {
      document.getElementById(`n${x}`).addEventListener("click", () => {
        n = x;
        reset();
      });
    }
  };

  p.draw = () => {
    p.background(0);

    robot.update(p.frameCount, DPAD.direction.digital);
    const robot_walk = robot.render(p.frameCount);
    robot_walk.draw(p);
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
