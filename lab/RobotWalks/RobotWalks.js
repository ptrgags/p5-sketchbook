import { Point } from "../../pga2d/objects.js";
import { ArcAngles } from "../../sketchlib/ArcAngles.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../../sketchlib/dimensions.js";
import { Direction } from "../../sketchlib/Direction.js";
import { draw_primitive } from "../../sketchlib/p5_helpers/draw_primitive.js";
import { GroupPrimitive } from "../../sketchlib/rendering/GroupPrimitive.js";
import {
  ArcPrimitive,
  CirclePrimitive,
  PolygonPrimitive,
} from "../../sketchlib/rendering/primitives.js";
import { group, style } from "../../sketchlib/rendering/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { Tween } from "../../sketchlib/Tween.js";
import { DirectionalPad } from "../lablib/DirectionalPad.js";
import { RobotCommand } from "./RobotCommand.js";

// How many frames to animate each 1/5 turn arc
const MOVEMENT_DURATION = 200;

const RobotAnimationState = {
  // Idle, waiting for commands
  IDLE: 0,
  // Currently
  MOVING: 1,
};

const GREY_LINES = new Style({
  stroke: Color.from_hex_code("#333333"),
  width: 4,
});
const RED_LINES = new Style({
  stroke: Color.RED,
  width: 4,
});

class AnimatedArc {
  /**
   * Constructor
   * @param {Point} center Center of the circle this arc lives on
   * @param {number} radius Radius of the circle
   * @param {ArcAngles} angles The angles for the full circular arc
   * @param {number} start_frame Start frame of the animation
   * @param {number} duration Duration of the animation in frames
   */
  constructor(center, radius, angles, start_frame, duration) {
    this.center = center;
    this.radius = radius;
    this.angles = angles;
    this.full_primitive = style(
      new ArcPrimitive(center, radius, angles),
      GREY_LINES
    );
    this.angle_tween = Tween.scalar(
      angles.start_angle,
      angles.end_angle,
      start_frame,
      duration
    );
  }

  /**
   * Check if the animation is finished
   * @param {number} frame The current frame number
   * @returns {boolean} True if the animation is finished.
   */
  is_done(frame) {
    return this.angle_tween.is_done(frame);
  }

  /**
   * Render an arc accurate for this frame
   * @param {number} frame Frame count
   * @returns {GroupPrimitive} A primitive to draw
   */
  render(frame) {
    // Compute a partial arc from the start angle to the current value
    // based on the tween.
    const interpolated_angles = new ArcAngles(
      this.angles.start_angle,
      this.angle_tween.get_value(frame)
    );
    const partial_arc = new ArcPrimitive(
      this.center,
      this.radius,
      interpolated_angles
    );

    // Draw the full primitive in grey, with the partial arc on top in red.
    const styled_arc = style(partial_arc, RED_LINES);
    return group(this.full_primitive, styled_arc);
  }
}

// Robot based on Project Euler #208, see https://projecteuler.net/problem=208
class Robot {
  constructor() {
    this.animation_state = RobotAnimationState.IDLE;
    this.command = RobotCommand.IDENTITY;
    /**
     * List of arcs the robot has already traversed
     * @type {ArcPrimitive[]}
     */
    this.history = [];
    this.history_primitive = style(this.history, RED_LINES);

    /**
     * @type {AnimatedArc | undefined}
     */
    this.current_arc = undefined;
  }

  start_moving(frame, dpad_direction) {
    const next_command =
      dpad_direction === Direction.LEFT
        ? RobotCommand.LEFT_TURN
        : RobotCommand.RIGHT_TURN;

    // TODO: Compute these.
    const computed_center = Point.ORIGIN;
    const computed_radius = 100;
    const computed_angles = new ArcAngles(0, (2.0 * PI) / 5);

    this.current_arc = new AnimatedArc(
      computed_center,
      computed_radius,
      computed_angles,
      frame,
      MOVEMENT_DURATION
    );
    this.animation_state = RobotAnimationState.MOVING;
  }

  update_idle(frame, dpad_direction) {
    if (
      dpad_direction !== Direction.LEFT &&
      dpad_direction !== Direction.RIGHT
    ) {
      return;
    }

    this.start_moving(frame, dpad_direction);
  }

  update_animate(frame, dpad_direction) {
    if (this.current_arc === undefined) {
      throw new Error("Current Arc not set!");
    }

    if (this.current_arc.is_done) {
      this.start_moving(frame, dpad_direction);
    }
  }

  /**
   * Update the robot
   * @param {number} frame The frame number
   * @param {Direction | undefined} dpad_direction The currently pressed DPAD direction
   */
  update(frame, dpad_direction) {
    if (this.animation_state === RobotAnimationState.IDLE) {
      return this.update_idle(frame, dpad_direction);
    } else {
      return this.update_animate(frame, dpad_direction);
    }
  }

  render(frame) {
    if (this.animation_state === RobotAnimationState.IDLE) {
      return this.history_primitive;
    }

    if (this.current_arc) {
      const arc_group = this.current_arc.render(frame);
      return group(this.history_primitive, arc_group);
    }
  }
}

const QUARTER_ARC = new ArcAngles(-Math.PI / 4, Math.PI / 4);
const arc_primitive = new ArcPrimitive(
  Point.point(WIDTH / 2, HEIGHT / 2),
  100,
  QUARTER_ARC
);

const BACKGROUND_LAYER = style(arc_primitive, GREY_LINES);
const ANIMATION = Tween.scalar(-Math.PI / 4, (2 * Math.PI) / 3, 100, 500);

const SAMPLE_PATH = [
  RobotCommand.LEFT_TURN,
  RobotCommand.LEFT_TURN,
  RobotCommand.RIGHT_TURN,
  RobotCommand.LEFT_TURN,
  RobotCommand.RIGHT_TURN,
];

let current = RobotCommand.IDENTITY;
const START_POINT = Point.ORIGIN.add(SCREEN_CENTER);
const STEP_LENGTH = 100;
const PATH = [START_POINT];
for (const [i, command] of SAMPLE_PATH.entries()) {
  current = RobotCommand.compose(command, current);
  const local_offset = command.offset;
  const global_offset = current.offset;

  // TODO: compute the arc that corresponds to the local offset but scaled up
  // to world space

  const point = START_POINT.add(global_offset.scale(STEP_LENGTH));
  PATH.push(point);
}

const POLY = new PolygonPrimitive(PATH);
const POLY_LAYER = style(POLY, RED_LINES);

const DPAD = new DirectionalPad();

const ROBOT = new Robot();

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );

    DPAD.setup();
  };

  p.draw = () => {
    p.background(0);

    //draw_primitive(p, BACKGROUND_LAYER);

    const current_angle = ANIMATION.get_value(p.frameCount);

    const current_arc = new ArcPrimitive(
      SCREEN_CENTER,
      100,
      //new ArcAngles(-Math.PI / 4, current_angle)
      new ArcAngles(0, (Math.PI / 2) * (p.frameCount / 500))
    );
    const reverse_arc = new ArcPrimitive(
      SCREEN_CENTER,
      50,
      new ArcAngles(0, -(Math.PI / 2) * (p.frameCount / 250))
    );
    const dynamic_layer = style([current_arc, reverse_arc], RED_LINES);
    draw_primitive(p, dynamic_layer);

    ROBOT.update(p.frameCount, DPAD.direction.digital);
    const robot_walk = ROBOT.render(p.frameCount);
    //draw_primitive(p, robot_walk);
  };

  p.keyPressed = (/** @type {KeyboardEvent} */ e) => {
    const code = e.code;
    DPAD.key_pressed(code);
  };
};
