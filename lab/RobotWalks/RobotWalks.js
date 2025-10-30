import { Point } from "../../pga2d/objects.js";
import { ArcAngles } from "../../sketchlib/ArcAngles.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../../sketchlib/dimensions.js";
import { Direction } from "../../sketchlib/Direction.js";
import { draw_primitive } from "../../sketchlib/p5_helpers/draw_primitive.js";
import { GroupPrimitive } from "../../sketchlib/rendering/GroupPrimitive.js";
import {
  ArcPrimitive,
  LinePrimitive,
  PointPrimitive,
} from "../../sketchlib/rendering/primitives.js";
import { group, style } from "../../sketchlib/rendering/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { Tween } from "../../sketchlib/Tween.js";
import { DirectionalPad } from "../lablib/DirectionalPad.js";
import { Oklch } from "../lablib/Oklch.js";
import { RobotCommand, ROOTS_OF_UNITY } from "./RobotCommand.js";

// How many frames to animate each 1/5 turn arc
const MOVEMENT_DURATION = 50;
const PIXELS_PER_METER = 100;

const START_POINT = Point.ORIGIN.add(SCREEN_CENTER);

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
const YELLOW_LINES = new Style({
  stroke: Color.YELLOW,
  width: 4,
});

const SEA_GREEN = new Oklch(0.7, 0.1, 196);
const POINT_STYLE = new Style({
  stroke: SEA_GREEN.adjust_lightness(-0.15).to_srgb(),
  fill: SEA_GREEN.to_srgb(),
  width: 2,
});

class AnimatedArc {
  /**
   * Constructor
   * @param {Point} center Center of the circle this arc lives on in screen space
   * @param {number} radius Radius of the circle this arc lives on in screen space
   * @param {ArcAngles} angles The angles for the full circular arc
   * @param {number} start_frame Start frame of the animation
   * @param {number} duration Duration of the animation in frames
   */
  constructor(center, radius, angles, start_frame, duration) {
    this.center = center;
    this.radius = radius;
    this.angles = angles;
    this.arc_primitive = new ArcPrimitive(center, radius, angles);
    this.line_primitive = new LinePrimitive(
      center.add(
        Point.dir_from_angle(-angles.start_angle).scale(PIXELS_PER_METER)
      ),
      center.add(
        Point.dir_from_angle(-angles.end_angle).scale(PIXELS_PER_METER)
      )
    );
    this.full_primitive = style(this.arc_primitive, GREY_LINES);
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
   * Get the current position on the arc
   * @param {number} frame The current frame number
   * @returns {Point} The current point on the arc
   */
  current_position(frame) {
    const angle = this.angle_tween.get_value(frame);
    // Flip angle so it's measured CCW
    const direction = Point.dir_from_angle(-angle);
    return this.center.add(direction.scale(PIXELS_PER_METER));
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
    /**
     * @type {LinePrimitive[]}
     */
    this.polyline_history = [];
    this.history_primitive = style(this.history, RED_LINES);
    this.polyline_primitive = style(this.polyline_history, YELLOW_LINES);

    /**
     * @type {AnimatedArc | undefined}
     */
    this.current_arc = undefined;
  }

  current_position(frame) {
    if (this.animation_state === RobotAnimationState.IDLE) {
      return START_POINT.add(this.command.offset.scale(PIXELS_PER_METER));
    }

    return this.current_arc.current_position(frame);
  }

  start_moving(frame, dpad_direction) {
    let command;
    let center_offset;
    if (dpad_direction === Direction.LEFT) {
      command = RobotCommand.LEFT_TURN;
      center_offset = ROOTS_OF_UNITY[this.command.orientation].neg();
    } else {
      command = RobotCommand.RIGHT_TURN;
      center_offset = ROOTS_OF_UNITY[this.command.orientation];
    }

    const current_position = START_POINT.add(
      this.command.offset.scale(PIXELS_PER_METER)
    );
    const arc_center = current_position.add(
      center_offset.scale(PIXELS_PER_METER)
    );

    const full_command = RobotCommand.compose(command, this.command);
    const prev_orientation = this.command.orientation;
    const orientation = full_command.orientation;

    const FIFTH_TURN = (2 * Math.PI) / 5;

    let computed_angles;
    if (dpad_direction === Direction.LEFT) {
      computed_angles = new ArcAngles(
        prev_orientation * FIFTH_TURN,
        orientation * FIFTH_TURN
      );
    } else {
      computed_angles = new ArcAngles(
        Math.PI - prev_orientation * FIFTH_TURN,
        Math.PI - orientation * FIFTH_TURN
      );
    }

    this.current_arc = new AnimatedArc(
      arc_center,
      // the arcs are always 1 meter in radius
      PIXELS_PER_METER,
      computed_angles,
      frame,
      MOVEMENT_DURATION
    );
    this.animation_state = RobotAnimationState.MOVING;
    this.command = full_command;
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

    if (this.current_arc.is_done(frame)) {
      const { arc_primitive, line_primitive } = this.current_arc;
      this.history.push(arc_primitive);
      this.polyline_history.push(line_primitive);

      if (
        dpad_direction === Direction.LEFT ||
        dpad_direction === Direction.RIGHT
      ) {
        this.start_moving(frame, dpad_direction);
      }
    }
  }

  /**
   * Update the robot
   * @param {number} frame The frame number
   * @param {Direction | undefined} dpad_direction The currently pressed DPAD direction
   */
  update(frame, dpad_direction) {
    if (this.animation_state === RobotAnimationState.IDLE) {
      this.update_idle(frame, dpad_direction);
      return;
    } else {
      this.update_animate(frame, dpad_direction);
      return;
    }
  }

  render(frame) {
    const current_position = new PointPrimitive(this.current_position(frame));
    const styled_position = style(current_position, POINT_STYLE);

    if (this.current_arc) {
      const arc_group = this.current_arc.render(frame);
      return group(
        this.polyline_primitive,
        this.history_primitive,
        arc_group,
        styled_position
      );
    }

    return group(
      this.polyline_primitive,
      this.history_primitive,
      styled_position
    );
  }
}

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

    ROBOT.update(p.frameCount, DPAD.direction.digital);
    const robot_walk = ROBOT.render(p.frameCount);
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
