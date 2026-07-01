import { SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { COLOR_SLEEP, COLOR_WAKE, DIAL_RADIUS } from "./constants.js";

const RADIUS_MARKER = 10;
const RADIUS_HIGHLIGHT = 15;

/**
 *
 * @param {number} hour
 * @returns {Point}
 */
function compute_position(hour) {
  const angle = -Math.PI / 2 + (hour * Math.PI) / 12;
  const offset = Direction.from_angle(angle).scale(DIAL_RADIUS);
  return SCREEN_CENTER.add(offset);
}

export class HourSelector {
  /**
   *
   * @param {number} hour current hour
   * @param {"wake" | "sleep"} sleep_or_wake Whether the marker represents
   */
  constructor(hour, sleep_or_wake) {
    this.hour = hour;
    this.position = compute_position(hour);
    this.sleep_or_wake = sleep_or_wake;

    const style_marker = new Style({
      fill: sleep_or_wake === "sleep" ? COLOR_SLEEP : COLOR_WAKE,
    });

    this.primitive = style(
      new Circle(this.position, RADIUS_MARKER),
      style_marker,
    );
  }

  /**
   * Check if the mouse is hovering over
   * @param {Point} mouse
   */
  is_hovering(mouse) {}
}
