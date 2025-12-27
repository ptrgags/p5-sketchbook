import { Direction } from "../pga2d/Direction.js";
import { mod } from "../sketchlib/mod.js";

export const MAX_N = 12;

/**
 * LUT of roots of unity for i in [1, MAX_N] (inclusive). Index 0 is undefined.
 * Each one is an array of a different length
 * @type {Direction[][]}
 */
export const ROOTS_OF_UNITY = new Array(MAX_N);
for (let i = 1; i <= MAX_N; i++) {
  ROOTS_OF_UNITY[i] = Direction.roots_of_unity(i);
}

/**
 * Displacement between the start and end of an arc. It will always be
 * the difference of two adjacent nth roots of unity.
 * Again, this is a LUT for each of the values of N
 * @type {Direction[][]}
 */
export const OFFSETS = new Array(MAX_N);
for (let n = 1; n <= MAX_N; n++) {
  const roots = ROOTS_OF_UNITY[n];
  const n_offsets = new Array(n);
  for (let i = 0; i < n; i++) {
    n_offsets[i] = roots[(i + 1) % n].sub(roots[i]);
  }
  OFFSETS[n] = n_offsets;
}

export class RobotCommand {
  /**
   * Constructor
   * @param {number} n The turn angle divisor (i.e. n=5 means 2pi/5 turns)
   * @param {number[]} weights n integers mod n that represent the multiples of the 5 offset vectors.
   * @param {number} orientation integer mod n that represents the orientation of the robot
   * @param {string} label The label for this sequence of commands
   */
  constructor(n, weights, orientation, label) {
    if (weights.length !== n) {
      throw new Error(
        `length of weights array must match n. expected ${n}, got ${weights.length}`
      );
    }
    this.n = n;
    this.weights = weights;
    this.orientation = orientation;
    this.label = label;
  }

  /**
   * Get a Direction representing the offset from the start. Units
   * are in model space, i.e. meters, y-up
   * @type {Direction}
   */
  get offset() {
    let result = Direction.ZERO;
    for (let i = 0; i < this.n; i++) {
      const weight = this.weights[i];
      const offset = OFFSETS[this.n][i];
      result = result.add(offset.scale(weight));
    }

    return result;
  }

  /**
   * Compose two robot commands. The one on the left is the newer one
   * (like function composition)
   *
   * This is a monoid operation.
   * @param {RobotCommand} next_command The next robot command to apply
   * @param {RobotCommand} prev_command The robot command that came before
   */
  static compose(next_command, prev_command) {
    if (prev_command.n !== next_command.n) {
      throw new Error(
        `mismatched n values cannot be composed: ${next_command.n}, ${prev_command.n}`
      );
    }

    const n = prev_command.n;
    const weights = new Array(n).fill(0);

    // command a needs to be rotated to the orientation of the robot after
    // taking command b. This amounts to cycling a's weights to the right by
    // the same number of places as b's orientation.
    const cycle_amount = prev_command.orientation;
    for (let i = 0; i < n; i++) {
      weights[i] =
        prev_command.weights[i] +
        next_command.weights[mod(i - cycle_amount, n)];
    }

    // The robot's orientation is the total rotation from both commands.
    const orientation =
      (prev_command.orientation + next_command.orientation) % n;

    // Concatenate the labels. The newest label is on the _left_, like
    // function application
    const label = next_command.label + prev_command.label;
    return new RobotCommand(n, weights, orientation, label);
  }

  /**
   * Identity command for a given n value
   * @param {number} n The number of turns in a circle
   * @returns {RobotCommand} The identity for an n-robot
   */
  static identity(n) {
    const weights = new Array(n).fill(0);
    return new RobotCommand(n, weights, 0, "");
  }

  /**
   * Single left turn command for an n-robot
   * @param {number} n The number of turns in a full circle
   * @returns {RobotCommand} The identity for an n-robot
   */
  static left_turn(n) {
    const weights = new Array(n).fill(0);
    weights[0] = 1;

    return new RobotCommand(n, weights, 1, "L");
  }

  /**
   * Single right turn command for an n-robot
   * @param {number} n The number of turns in a full circle
   * @returns {RobotCommand} The right turn for an n-robot
   */
  static right_turn(n) {
    const weights = new Array(n).fill(0);
    weights[n - 1] = 1;

    return new RobotCommand(n, weights, n - 1, "R");
  }
}
