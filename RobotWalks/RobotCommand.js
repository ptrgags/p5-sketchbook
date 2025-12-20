import { Direction } from "../pga2d/Direction.js";
import { mod } from "../sketchlib/mod.js";

export const N = 5;
export const ROOTS_OF_UNITY = Direction.roots_of_unity(N);

// Displacement between the start and end of the arc. It will always be
// the difference of two adjacent fifth roots of unity
const OFFSETS = new Array(N);
for (let i = 0; i < N; i++) {
  OFFSETS[i] = ROOTS_OF_UNITY[(i + 1) % N].sub(ROOTS_OF_UNITY[i]);
}

export class RobotCommand {
  /**
   * Constructor
   * @param {number[]} weights 5 integers mod 5 that represent the multiples of the 5 offset vectors.
   * @param {number} orientation integer mod 5 that represents the orientation of the robot
   * @param {string} label The label for this sequence of commands
   */
  constructor(weights, orientation, label) {
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
    for (let i = 0; i < N; i++) {
      const weight = this.weights[i];
      const offset = OFFSETS[i];
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
    const weights = new Array(5).fill(0);

    // command a needs to be rotated to the orientation of the robot after
    // taking command b. This amounts to cycling a's weights to the right by
    // the same number of places as b's orientation.
    const cycle_amount = prev_command.orientation;
    for (let i = 0; i < N; i++) {
      weights[i] =
        prev_command.weights[i] +
        next_command.weights[mod(i - cycle_amount, N)];
    }

    // The robot's orientation is the total rotation from both commands.
    const orientation =
      (prev_command.orientation + next_command.orientation) % N;

    // Concatenate the labels. The newest label is on the _left_, like
    // function application
    const label = next_command.label + prev_command.label;

    return new RobotCommand(weights, orientation, label);
  }
}

RobotCommand.IDENTITY = Object.freeze(new RobotCommand([0, 0, 0, 0, 0], 0, ""));
RobotCommand.LEFT_TURN = Object.freeze(
  new RobotCommand([1, 0, 0, 0, 0], 1, "L")
);
RobotCommand.RIGHT_TURN = Object.freeze(
  new RobotCommand([0, 0, 0, 0, 1], 4, "R")
);
