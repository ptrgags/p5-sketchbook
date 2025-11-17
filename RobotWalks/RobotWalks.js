import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { draw_primitive } from "../sketchlib/p5_helpers/draw_primitive.js";
import { DirectionalPad } from "../lab/lablib/DirectionalPad.js";
import { ArcRobot } from "./ArcRobot.js";

const DPAD = new DirectionalPad();

export const sketch = (p) => {
  let robot = new ArcRobot();

  function reset() {
    robot = new ArcRobot();
  }

  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );

    DPAD.setup();

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
};
