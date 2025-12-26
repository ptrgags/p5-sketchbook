import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { DirectionalPad } from "../lab/lablib/DirectionalPad.js";
import { ArcRobot, N_VALUES } from "./ArcRobot.js";
import { TouchButton } from "../lab/lablib/TouchButton.js";
import { Rectangle } from "../lab/lablib/Rectangle.js";
import { CanvasMouseHandler } from "../lab/lablib/CanvasMouseHandler.js";
import { AnimatedPath } from "./AnimatedPath.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Point } from "../pga2d/Point.js";
import { Direction } from "../pga2d/Direction.js";

const MOUSE = new CanvasMouseHandler();
const DPAD = new DirectionalPad();
const THIRD_SCREEN = new Direction(WIDTH / 3, HEIGHT);

// Virtual touch buttons for directional buttons on mobile.
const TOUCH_LEFT = new TouchButton(new Rectangle(Point.ORIGIN, THIRD_SCREEN));
const TOUCH_RIGHT = new TouchButton(
  new Rectangle(new Point((2 * WIDTH) / 3, 0), THIRD_SCREEN)
);
const TOUCH_DOWN = new TouchButton(
  new Rectangle(
    new Point(WIDTH / 3, (3 * HEIGHT) / 4),
    new Direction(WIDTH / 3, HEIGHT / 4)
  )
);

// TEMP CODE
const RIGHT_ARC = new ArcAngles(-Math.PI / 2, Math.PI / 2);
const LEFT_ARC = new ArcAngles((3 * Math.PI) / 2, Math.PI / 2);
const DOWN_STRIDE = Direction.DIR_Y.scale(100);

const ANIMATED_PATH_EX = new AnimatedPath(
  [
    new ArcPrimitive(SCREEN_CENTER, 50, RIGHT_ARC),
    new ArcPrimitive(SCREEN_CENTER.add(DOWN_STRIDE), 50, LEFT_ARC),
    new ArcPrimitive(SCREEN_CENTER.add(DOWN_STRIDE.scale(2.0)), 50, RIGHT_ARC),
  ],
  0,
  500,
  false
);

export const sketch = (p) => {
  let robot = new ArcRobot(5);

  /**
   * Switch to a different robot. This will animate unwinding the current
   * path and winding the same path from the new robot's perspective
   * @param {number} n The n value for the next n-robot
   */
  function switch_robot(n) {
    const commands = robot.command_list;
    // Reset the robot, and when that's done, swap it for a new robot
    robot.events.addEventListener("reset", () => {
      robot = new ArcRobot(n, commands);
    });

    robot.reset(p.frameCount);
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
    TOUCH_DOWN.events.addEventListener("pressed", () => {
      DPAD.key_pressed("ArrowDown");
    });
    TOUCH_DOWN.events.addEventListener("released", () => {
      DPAD.key_pressed("ArrowDown");
    });

    document.getElementById("reset").addEventListener("click", () => {
      robot.reset(p.frameCount);
    });

    for (const m of N_VALUES) {
      document.getElementById(`n${m}`).addEventListener("click", () => {
        switch_robot(m);
      });
    }
  };

  p.draw = () => {
    p.background(0);

    robot.update(p.frameCount, DPAD.direction.digital);
    const robot_walk = robot.render(p.frameCount);
    robot_walk.draw(p);

    TOUCH_LEFT.debug_render().draw(p);
    TOUCH_RIGHT.debug_render().draw(p);
    TOUCH_DOWN.debug_render().draw(p);

    p.push();
    p.noFill();
    p.stroke(255);
    ANIMATED_PATH_EX.render(p.frameCount).draw(p);
    p.pop();
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
    TOUCH_DOWN.mouse_pressed(input.mouse_coords);
  });

  MOUSE.mouse_moved(p, (input) => {
    TOUCH_LEFT.mouse_moved(input.mouse_coords);
    TOUCH_RIGHT.mouse_moved(input.mouse_coords);
    TOUCH_DOWN.mouse_moved(input.mouse_coords);
  });

  MOUSE.mouse_released(p, (input) => {
    TOUCH_LEFT.mouse_released(input.mouse_coords);
    TOUCH_RIGHT.mouse_released(input.mouse_coords);
    TOUCH_DOWN.mouse_released(input.mouse_coords);
  });

  MOUSE.mouse_dragged(p, (input) => {
    TOUCH_LEFT.mouse_dragged(input.mouse_coords);
    TOUCH_RIGHT.mouse_dragged(input.mouse_coords);
    TOUCH_DOWN.mouse_released(input.mouse_coords);
  });
};
