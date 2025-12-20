import { Oklch } from "../lab/lablib/Oklch.js";
import { Point } from "../pga2d/objects.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Color } from "../sketchlib/Color.js";
import { SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/Direction.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { AnimatedPath } from "./AnimatedPath.js";
import { RobotCommand, ROOTS_OF_UNITY } from "./RobotCommand.js";

/**
 * Given an array, make a reverse lookup table
 * @template T
 * @param {Array<T>} arr The original array
 * @returns {Object.<T, number>}
 */
function inverse_array(arr) {
  /**
   * @type {Object.<T, number>}
   */
  const result = {};
  for (const [i, x] of arr.entries()) {
    result[x] = i;
  }
  return result;
}

// I'm allowing onlythe following values for their visual interest
export const N_VALUES = [3, 4, 5, 6, 8, 12];
export const N_VALUES_INV = inverse_array(N_VALUES);
const COLORS = Oklch.gradient(
  new Oklch(0.7, 0.1, 0),
  new Oklch(0.7, 0.1, 360),
  N_VALUES.length
);
const N_STYLES = COLORS.map(
  (x) => new Style({ stroke: x.to_srgb(), width: 2 })
);

const GREY_LINES = new Style({
  stroke: Color.from_hex_code("#777777"),
  width: 2,
});

// How many frames to animate a single arc
const FULL_CIRCLE_DURATION = 120;
// Duration to unwind the path in frames
const DURATION_UNWIND_PATH = 50;

const PIXELS_PER_METER = 25;
const START_POINT = Point.ORIGIN.add(SCREEN_CENTER);

/**
 * @enum {number}
 */
const RobotAnimationState = {
  // Idle, waiting for commands
  IDLE: 0,
  // Currently animating a single arc path or undo
  MOVING: 1,
  // Unwinding back to the original state
  RESETTING: 2,
};

class ArcRobotState {
  /**
   * Constructor
   * @param {number} n the n value for this n-robot
   * @param {"L" | "R"} arc_dir The arc direction
   * @param {RobotCommand} command The command from the start to the latest step
   * @param {ArcPrimitive} arc The arc for the latest step
   */
  constructor(n, arc_dir, command, arc) {
    this.n = n;
    this.arc_dir = arc_dir;
    this.command = command;
    this.arc = arc;
  }

  /**
   * Compute the state after the robot takes a single step
   * @param {number} n The n-value for this n-robot
   * @param {"L" | "R"} arc_dir Arc direction
   * @param {ArcRobotState | undefined} prev_state Previous state
   */
  static take_step(n, arc_dir, prev_state) {
    const prev_command = prev_state?.command ?? RobotCommand.identity(n);

    // Imagine the robot's orientation as the robot walking CCW around the
    // unit circle. At each point 1/n of the way around, the "left" direction
    // points towards the center of the circle, and the "right" direction
    // points directly outwards. Furthermore, in model space we defined
    // the arc radius as 1 meter. So the right direction is _exactly_ the
    // corresponding root of unity. And left is just its negation.
    /**
     * @type {Point}
     */
    let to_center_model = ROOTS_OF_UNITY[n][prev_command.orientation];
    /**
     * @type {RobotCommand}
     */
    let step_command;
    if (arc_dir === "L") {
      step_command = RobotCommand.left_turn(n);
      to_center_model = to_center_model.neg();
    } else {
      step_command = RobotCommand.right_turn(n);
    }

    const start_offset_model = prev_command.offset;
    // this is still a direction for now
    const arc_center_model = start_offset_model.add(to_center_model);

    const start_orientation = prev_command.orientation;

    const turn_angle = (2 * Math.PI) / n;

    let angles_model;
    if (arc_dir === "L") {
      const start_angle = start_orientation * turn_angle;
      angles_model = new ArcAngles(start_angle, start_angle + turn_angle);
    } else {
      const start_angle = start_orientation * turn_angle + Math.PI;
      angles_model = new ArcAngles(start_angle, start_angle - turn_angle);
    }

    // Model space is y-up, but screen space is y-down
    const arc_center_screen = START_POINT.add(
      arc_center_model.flip_y().scale(PIXELS_PER_METER)
    );
    const angles_screen = angles_model.flip_y();

    // Create the arc which uses units of screen space (y-down!!)
    const arc = new ArcPrimitive(
      arc_center_screen,
      PIXELS_PER_METER,
      angles_screen
    );

    const full_command = RobotCommand.compose(step_command, prev_command);

    return new ArcRobotState(n, arc_dir, full_command, arc);
  }
}

/**
 * Robot based on Project Euler #208, see https://projecteuler.net/problem=208
 */
export class ArcRobot {
  /**
   * Constructor
   * @param {number} n Positive integer n to determine the arc angle 2pi/n
   * @param {("L" | "R")[]} [command_list] String of L and R to start the robot with an initial path
   */
  constructor(n, command_list) {
    this.n = n;

    /**
     * @type {number}
     */
    this.movement_duration = FULL_CIRCLE_DURATION / n;

    /**
     * @type {Style}
     */
    this.line_style = N_STYLES[N_VALUES_INV[n]];

    /**
     * @type {RobotAnimationState}
     */
    this.animation_state = RobotAnimationState.IDLE;

    /**
     * Event target with the following events
     * - reset - when the robot finishes the resetting animation and returns to the IDLE state.
     * @type {EventTarget}
     */
    this.events = new EventTarget();

    /**
     * Sequence of states for this robot
     * @type {ArcRobotState[]}
     */
    this.history = [];

    /**
     * Collection of path primitives for the past portion of the path
     * @type {GroupPrimitive}
     */
    this.past_path = GroupPrimitive.EMPTY;

    /**
     * Currently animating part of the path
     * @type {AnimatedPath}
     */
    this.current_path = new AnimatedPath([], 0, 0, false);

    /**
     *
     * @type {("L" | "R")[] | undefined}
     */
    this.initial_commands = command_list;
  }

  /**
   * Get a list of L/R commands as a str
   * @type {("L" | "R")[]}
   */
  get command_list() {
    return this.history.map((x) => x.arc_dir);
  }

  /**
   *
   * @param {("L" | "R")[]} command_list
   */
  start_winding(frame, command_list) {
    for (const [i, arc_dir] of command_list.entries()) {
      const state = ArcRobotState.take_step(
        this.n,
        arc_dir,
        this.history[i - 1]
      );
      this.history.push(state);
    }

    this.past_path = GroupPrimitive.EMPTY;
    const all_arcs = this.history.map((x) => x.arc);
    this.current_path = new AnimatedPath(
      all_arcs,
      frame,
      DURATION_UNWIND_PATH,
      // wind forwards
      false
    );

    this.animation_state = RobotAnimationState.MOVING;
  }

  start_undo(frame) {
    this.history.pop();

    const all_arcs = this.history.map((x) => x.arc);
    const past_arcs = all_arcs.slice(0, all_arcs.length - 1);
    this.past_path = style(past_arcs, this.line_style);

    const last_arc = all_arcs[all_arcs.length - 1];
    this.current_path = new AnimatedPath(
      [last_arc],
      frame,
      this.movement_duration,
      // animate in reverse
      true
    );
  }

  /**
   *
   * @param {number} frame The current frame number
   * @param {Direction} dpad_direction
   */
  start_step(frame, dpad_direction) {
    const arc_dir = dpad_direction === Direction.LEFT ? "L" : "R";
    const prev_state = this.history[this.history.length - 1];
    this.history.push(ArcRobotState.take_step(this.n, arc_dir, prev_state));

    const all_arcs = this.history.map((x) => x.arc);
    const past_arcs = all_arcs.slice(0, all_arcs.length - 1);
    this.past_path = style(past_arcs, this.line_style);

    const last_arc = all_arcs[all_arcs.length - 1];
    this.current_path = new AnimatedPath(
      [last_arc],
      frame,
      this.movement_duration,
      // forwards
      false
    );
  }

  update_idle(frame, dpad_direction) {
    if (dpad_direction === Direction.DOWN) {
      this.start_undo(frame);
      this.animation_state = RobotAnimationState.MOVING;
      return;
    } else if (
      dpad_direction === Direction.LEFT ||
      dpad_direction === Direction.RIGHT
    ) {
      this.start_step(frame, dpad_direction);
      this.animation_state = RobotAnimationState.MOVING;
      return;
    }
  }

  update_animate(frame, dpad_direction) {
    // make sure the current path exists
    // if the current path is done animating,
  }

  update_reset(frame, dpad_direction) {
    if (!this.current_path.is_done(frame)) {
      return;
    }

    this.events.dispatchEvent(new CustomEvent("reset"));
  }

  /**
   * Update the robot each frame
   * @param {number} frame The current frame number
   * @param {Direction | undefined} dpad_direction The current direction button pressed
   */
  update(frame, dpad_direction) {
    // On the first frame, if we have initial commands, start a winding
    // animation
    if (this.initial_commands) {
      this.start_winding(frame, this.command_list);
      this.initial_commands = undefined;
      return;
    }

    if (this.animation_state === RobotAnimationState.IDLE) {
      this.update_idle(frame, dpad_direction);
      return;
    } else if (this.animation_state === RobotAnimationState.MOVING) {
      this.update_animate(frame, dpad_direction);
      return;
    }
    if (this.animation_state === RobotAnimationState.RESETTING) {
      this.update_reset(frame, dpad_direction);
      return;
    }
  }

  /**
   * @param {number} frame the current frame number
   * @returns {GroupPrimitive} The primitive to render
   */
  render(frame) {
    const trajectory = style(this.current_path.trajectory, GREY_LINES);
    const motion = style(this.current_path.render(frame), this.line_style);

    return group(this.past_path, trajectory, motion);
  }

  reset(frame) {
    this.past_path = GroupPrimitive.EMPTY;
    const all_arcs = this.history.map((x) => x.arc);
    this.current_path = new AnimatedPath(
      all_arcs,
      frame,
      DURATION_UNWIND_PATH,
      // wind forwards
      false
    );
    this.animation_state === RobotAnimationState.RESETTING;
  }
}
