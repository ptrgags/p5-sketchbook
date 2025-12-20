import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { draw_primitive } from "../sketchlib/p5_helpers/draw_primitive.js";
import { DirectionalPad } from "../lab/lablib/DirectionalPad.js";
import { ArcRobot, N_VALUES } from "./ArcRobot.js";
import { TouchButton } from "../lab/lablib/TouchButton.js";
import { Rectangle } from "../lab/lablib/Rectangle.js";
import { Point } from "../pga2d/objects.js";
import { CanvasMouseHandler } from "../lab/lablib/CanvasMouseHandler.js";

const MOUSE = new CanvasMouseHandler();
const DPAD = new DirectionalPad();
const THIRD_SCREEN = Point.direction(WIDTH / 3, HEIGHT);

// Virtual touch buttons for left and right keys on mobile.
const TOUCH_LEFT = new TouchButton(new Rectangle(Point.ORIGIN, THIRD_SCREEN));
const TOUCH_RIGHT = new TouchButton(
  new Rectangle(Point.point(2 * WIDTH / 3, 0), THIRD_SCREEN)
);
const TOUCH_DOWN = new TouchButton(
  new Rectangle(Point.point(WIDTH / 3, 3 * HEIGHT / 4), Point.direction(WIDTH / 3, HEIGHT / 4))
)

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
    })
    TOUCH_DOWN.events.addEventListener("released", () => {
      DPAD.key_pressed("ArrowDown")
    })

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
    draw_primitive(p, robot_walk);

    draw_primitive(p, TOUCH_LEFT.debug_render());
    draw_primitive(p, TOUCH_RIGHT.debug_render());
    draw_primitive(p, TOUCH_DOWN.debug_render());
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
