import { Point } from "../../pga2d/objects.js";

export const N = 5;

// TODO: This should be part of Point
/**
 * @type {Point[]}
 */
const ROOTS_OF_UNITY = new Array(N);
for (let i = 0; i < N; i++) {
  const angle = ((2 * Math.PI) / N) * i;
  ROOTS_OF_UNITY[i] = Point.dir_from_angle(angle);
}

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
   * Get a Point.direction representing the offset from the start
   * @type {Point}
   */
  get offset() {
    let result = Point.ZERO;
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
   * @param {RobotCommand} a The first robot command
   * @param {RobotCommand} b The second robot command
   */
  static compose(a, b) {
    const weights = new Array(5).fill(0);
    for (let i = 0; i < N; i++) {
      weights[i] = b.weights[(b.orientation + i) % N] + a.weights[i];
    }

    const orientation = (a.orientation + b.orientation) % N;
    const label = a.label + b.label;

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
