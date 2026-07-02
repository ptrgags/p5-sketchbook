import { mod } from "../sketchlib/mod.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { DIAL_CENTER, DIAL_RADIUS } from "./constants.js";

/**
 * Compute the position on the clock based on the hour
 * @param {number} hour Hour (rounded to nearest quarter hour)
 * @returns {Point} Position on the screen.
 */
export function compute_position(hour) {
  const angle = -Math.PI / 2 + (hour * Math.PI) / 12;
  const offset = Direction.from_angle(angle).scale(DIAL_RADIUS);
  return DIAL_CENTER.add(offset);
}

/**
 * Compute the hour rounded to the nearest quarter hour
 * @param {Point} position position on the screen
 * @returns {number} hour (rounded to nearest quarter hour)
 */
export function compute_hour(position) {
  const from_center = position.sub(DIAL_CENTER);
  const angle = Math.atan2(from_center.y, from_center.x);
  const continuous_hour = mod((12 / Math.PI) * angle + 6, 24);
  const nearest_quarter = 0.25 * Math.floor(4 * continuous_hour);
  return nearest_quarter;
}
