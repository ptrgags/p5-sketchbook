import { Oklch } from "../lab/lablib/Oklch.js";
import { Direction } from "../sketchlib/Direction.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { group } from "../sketchlib/primitives/shorthand.js";

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
export const COLORS = Oklch.gradient(
  new Oklch(0.7, 0.1, 0),
  new Oklch(0.7, 0.1, 360),
  N_VALUES.length
);

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

/**
 * Robot based on Project Euler #208, see https://projecteuler.net/problem=208
 */
export class ArcRobot {
  /**
   * Constructor
   * @param {number} n Positive integer n to determine the arc angle 2pi/n
   */
  constructor(n) {
    this.n = n;

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
  }

  /**
   *
   * @param {number} frame The current frame number
   * @param {Direction | undefined} dpad_direction The current direction button pressed
   */
  update(frame, dpad_direction) {
    // TODO
  }

  /**
   * @param {number} frame th
   * @returns {GroupPrimitive}
   */
  render(frame) {
    return group();
  }

  reset() {}
}
