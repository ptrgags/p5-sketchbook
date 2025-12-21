import { Direction } from "../pga2d/Direction.js";

/**
 * One of the 4 cardinal directions. They're ordered from the right in CCW
 * order (so they correspond to 90 degree angles in radians)
 * @readonly
 * @enum {Number}
 */
export const CardinalDirection = {
  RIGHT: 0,
  UP: 1,
  LEFT: 2,
  DOWN: 3,
  COUNT: 4,
};

/**
 * Get the opposite direction
 * @param {CardinalDirection} direction The direction
 * @returns {CardinalDirection} The opposite direction
 */
export function opposite(direction) {
  switch (direction) {
    case CardinalDirection.LEFT:
      return CardinalDirection.RIGHT;
    case CardinalDirection.RIGHT:
      return CardinalDirection.LEFT;
    case CardinalDirection.UP:
      return CardinalDirection.DOWN;
    case CardinalDirection.DOWN:
      return CardinalDirection.UP;
  }
}

/**
 * Return a (y-up) PGA direction. This is helpful when working with math
 * If you need y-down, use to_direction().flip_y()
 * @param {CardinalDirection | undefined} direction The direction constant
 * @returns {Direction} A PGA direction object corresponding to the same direction
 */
export function to_direction(direction) {
  switch (direction) {
    case CardinalDirection.LEFT:
      return Direction.DIR_X.neg();
    case CardinalDirection.RIGHT:
      return Direction.DIR_X;
    case CardinalDirection.UP:
      return Direction.DIR_Y;
    case CardinalDirection.DOWN:
      return Direction.DIR_Y.neg();
  }

  return Direction.ZERO;
}
