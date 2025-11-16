import { Point } from "../../pga2d/objects.js";
import { ArcAngles } from "../../sketchlib/ArcAngles.js";
import { Color } from "../../sketchlib/Color.js";
import { SCREEN_CENTER } from "../../sketchlib/dimensions.js";
import { Direction } from "../../sketchlib/Direction.js";
import { ArcPrimitive, LinePrimitive, PointPrimitive } from "../../sketchlib/rendering/primitives.js";
import { group, style } from "../../sketchlib/rendering/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { Oklch } from "../lablib/Oklch.js";
import { AnimatedArc } from "./AnimatedArc.js";
import { RobotCommand, ROOTS_OF_UNITY } from "./RobotCommand.js";

// How many frames to animate each 1/5 turn arc
const MOVEMENT_DURATION = 50;
const PIXELS_PER_METER = 100;

const START_POINT = Point.ORIGIN.add(SCREEN_CENTER);


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