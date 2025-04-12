import { Point } from "../../pga2d/objects.js";
import { Direction } from "../../sketchlib/Direction.js";

export class DirectionInput {
  /**
   *
   * @param {Direction | undefined} digital The direction that was pressed as a
   * cardinal direction, or undefined if there's no input
   * @param {Point} analog The direction that was pressed as an analog value.
   * It is either Point.ZERO (no input)
   */
  constructor(digital, analog) {
    this.digital = digital;
    this.analog = analog;
  }
}
DirectionInput.NO_INPUT = Object.freeze(
  new DirectionInput(undefined, Point.ZERO)
);
