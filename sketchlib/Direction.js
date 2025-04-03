import { Point } from "../pga2d/objects.js";

/**
 * One of the 4 cardinal directions. They're ordered from the right in CCW
 * order (so they correspond to 90 degree angles in radians)
 * @readonly
 * @enum {Number}
 */
export const Direction = {
  RIGHT: 0,
  UP: 1,
  LEFT: 2,
  DOWN: 3,
  COUNT: 4,
};

/**
 * Get the opposite direction
 * @param {Direction} direction The direction
 * @returns {Direction} The opposite direction
 */
export function opposite(direction) {
  switch (direction) {
    case Direction.LEFT:
      return Direction.RIGHT;
    case Direction.RIGHT:
      return Direction.LEFT;
    case Direction.UP:
      return Direction.DOWN;
    case Direction.DOWN:
      return Direction.UP;
  }
}

/**
 * Return a (y-up) PGA direction
 * @param {Direction} direction The direction constant
 * @returns {Point} A PGA direction object corresponding to the same direction
 */
export function to_pga_direction(direction) {
  switch (direction) {
    case Direction.LEFT:
      return Point.DIR_X.scale(-1);
    case Direction.RIGHT:
      return Point.DIR_X;
    case Direction.UP:
      return Point.DIR_Y;
    case Direction.DOWN:
      return Point.DIR_Y.scale(-1);
  }
}
