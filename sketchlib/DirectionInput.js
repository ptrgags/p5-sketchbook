import { Direction } from "../sketchlib/pga2d/Direction.js";
import { CardinalDirection } from "./CardinalDirection.js";

export class DirectionInput {
  /**
   *
   * @param {CardinalDirection | undefined} digital The direction that was pressed as a
   * cardinal direction, or undefined if there's no input
   * @param {Direction} analog The direction that was pressed as an analog value.
   * It is either Point.ZERO (no input)
   */
  constructor(digital, analog) {
    this.digital = digital;
    this.analog = analog;
  }

  /**
   * Combine directional inputs by taking the first one that's non-zero
   * @param {DirectionInput} a The first input value
   * @param {DirectionInput} b The second input value
   * @returns {DirectionInput} The first input that is not zero
   */
  static first_nonzero(a, b) {
    return a.digital !== undefined ? a : b;
  }
}
DirectionInput.NO_INPUT = Object.freeze(
  new DirectionInput(undefined, Direction.ZERO),
);
