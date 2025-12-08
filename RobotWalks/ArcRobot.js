import { Point } from "../pga2d/objects.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Color } from "../sketchlib/Color.js";
import { SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/Direction.js";
import { GroupPrimitive } from "../sketchlib/rendering/GroupPrimitive.js";
import {
  ArcPrimitive,
  LinePrimitive,
  PointPrimitive,
} from "../sketchlib/rendering/primitives.js";
import { group, style } from "../sketchlib/rendering/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { Oklch } from "../lab/lablib/Oklch.js";
import { AnimatedArc } from "./AnimatedArc.js";
import { RobotCommand, ROOTS_OF_UNITY } from "./RobotCommand.js";

// How many frames to animate each 1/5 turn arc
const MOVEMENT_DURATION = 25;
const PIXELS_PER_METER = 25;
const ORIENTATION_LINE_LENGTH = 25;

const START_POINT = Point.ORIGIN.add(SCREEN_CENTER);

const RED_LINES = new Style({
  stroke: Color.RED,
  width: 2,
});
const GREY_LINES = new Style({
  stroke: Color.from_hex_code("#777777"),
  width: 2,
});
const YELLOW_LINES = new Style({
  stroke: Color.YELLOW,
  width: 2,
});

const SEA_GREEN = new Oklch(0.7, 0.1, 196);
const POINT_STYLE = new Style({
  stroke: SEA_GREEN.adjust_lightness(-0.15).to_srgb(),
  fill: SEA_GREEN.to_srgb(),
  width: 2,
});

/**
 * @enum {number}
 */
const RobotAnimationState = {
  // Idle, waiting for commands
  IDLE: 0,
  // Currently
  MOVING: 1,
};

/**
 * Robot based on Project Euler #208, see https://projecteuler.net/problem=208
 */
export class ArcRobot {
  /**
   * Constructor
   * @param {number} n Turn amount as a positive integer. This is the divisor of 2pi
   */
  constructor(n) {
    this.n = n;
    this.turn_angle = (2.0 * Math.PI) / n;

    /**
     * @type {RobotAnimationState}
     */
    this.animation_state = RobotAnimationState.IDLE;

    /**
     * The sequence of commands that led the robot to its current state.
     * @type {RobotCommand}
     */
    this.command_seq = RobotCommand.identity(this.n);

    /**
     * List of arcs the robot has already traversed, in pixels
     * @type {ArcPrimitive[]}
     */
    this.history = [];
    /**
     * Styled version of the history primitive
     * @type {GroupPrimitive}
     */
    this.history_primitive = style(this.history, RED_LINES);

    /**
     * List of line segments the robot has already traversed, in pixels
     * @type {LinePrimitive[]}
     */
    this.polyline_history = [];
    /**
     * Styled version of the polyline history
     * @type {GroupPrimitive}
     */
    this.polyline_primitive = style(this.polyline_history, YELLOW_LINES);

    /**
     * If the robot is currently moving, this will be an AnimatedArc for that
     * segment in pixel space
     * @type {AnimatedArc | undefined}
     */
    this.current_arc = undefined;
  }

  current_position(frame) {
    if (this.animation_state === RobotAnimationState.IDLE) {
      const offset = this.command_seq.offset.scale(PIXELS_PER_METER);
      return START_POINT.add(offset);
    }

    return this.current_arc.current_position(frame);
  }

  forward_dir(frame) {
    if (this.animation_state === RobotAnimationState.IDLE) {
      const orientation = this.command_seq.orientation;
      // Orientation is measured from north, so add a quarter turn
      const angle = orientation * this.turn_angle + Math.PI / 2;
      return Point.dir_from_angle(angle).flip_y();
    }

    return this.current_arc.forward_dir(frame);
  }

  start_moving(frame, dpad_direction) {
    // The D-pad key determines whether the arc curves to the left or right.
    let command;
    // Imagine the robot's orientation as the robot walking CCW around the
    // unit circle. At each point 1/5 of the way around, the "left" direction
    // points towards the center of the circle, and the "right" direction
    // points directly outwards. Furthermore, in model space we defined
    // the arc radius as 1 meter. So the right direction is _exactly_ the
    // corresponding root of unity. And left is just its negation.
    let to_center_model = ROOTS_OF_UNITY[this.n][this.command_seq.orientation];
    if (dpad_direction === Direction.LEFT) {
      command = RobotCommand.left_turn(this.n);
      to_center_model = to_center_model.neg();
    } else {
      command = RobotCommand.right_turn(this.n);
    }

    const start_offset_model = this.command_seq.offset;
    // this is still a direction for now
    const arc_center_model = start_offset_model.add(to_center_model);

    // Full command sequence when we append the new command
    const full_command_seq = RobotCommand.compose(command, this.command_seq);

    const start_orientation = this.command_seq.orientation;

    let angles_model;
    if (dpad_direction === Direction.LEFT) {
      const start_angle = start_orientation * this.turn_angle;
      angles_model = new ArcAngles(start_angle, start_angle + this.turn_angle);
    } else {
      const start_angle = start_orientation * this.turn_angle + Math.PI;
      angles_model = new ArcAngles(start_angle, start_angle - this.turn_angle);
    }

    // Model space is y-up, but screen space is y-down
    const arc_center_screen = START_POINT.add(
      arc_center_model.flip_y().scale(PIXELS_PER_METER)
    );
    const angles_screen = angles_model.flip_y();

    // Create the arc which uses units of screen space (y-down!!)
    this.current_arc = new AnimatedArc(
      arc_center_screen,
      // the arcs are always 1 meter in radius
      PIXELS_PER_METER,
      angles_screen,
      frame,
      MOVEMENT_DURATION
    );
    this.animation_state = RobotAnimationState.MOVING;
    this.command_seq = full_command_seq;
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

  /**
   * Render the current frame
   * @param {number} frame The frame number
   * @returns {GroupPrimitive} Primitives to render
   */
  render(frame) {
    const pos = this.current_position(frame);
    const step_forward = pos.add(
      this.forward_dir(frame).scale(ORIENTATION_LINE_LENGTH)
    );

    const current_position = new PointPrimitive(pos);
    const styled_position = style(current_position, POINT_STYLE);

    const orientation_line = new LinePrimitive(pos, step_forward);
    const styled_orientation = style(orientation_line, YELLOW_LINES);

    if (this.current_arc) {
      const arc_bg = style(this.current_arc.arc_primitive, GREY_LINES);
      const arc_fg = style(this.current_arc.render(frame), RED_LINES);

      return group(
        this.history_primitive,
        arc_bg,
        arc_fg,
        styled_orientation,
        styled_position
      );
    }

    return group(this.history_primitive, styled_orientation, styled_position);
  }
}
