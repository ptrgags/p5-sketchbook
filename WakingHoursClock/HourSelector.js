import { SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { ShowHidePrimitive } from "../sketchlib/primitives/ShowHidePrimitive.js";
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
   * Constructor
   * @param {number} hour current hour
   * @param {"wake" | "sleep"} sleep_or_wake Whether the marker represents
   */
  constructor(hour, sleep_or_wake) {
    this.hour = hour;
    this.position = compute_position(hour);
    this.sleep_or_wake = sleep_or_wake;

    // Save the two circles so we can update the positions
    this.marker_circle = new Circle(this.position, RADIUS_MARKER);
    this.highlight_circle = new Circle(this.position, RADIUS_HIGHLIGHT);
    // also need to save a reference to the show/hide flag.
    this.show_highlight = new ShowHidePrimitive(
      [this.highlight_circle],
      [false],
    );

    const color = sleep_or_wake === "sleep" ? COLOR_SLEEP : COLOR_WAKE;
    const highlight_color = color.adjust_lightness(0.1);
    const style_marker = new Style({
      fill: color,
    });
    const style_highlight = new Style({
      fill: highlight_color,
    });

    this.primitive = group(
      style(this.show_highlight, style_highlight),
      style(this.marker_circle, style_marker),
    );
  }

  /**
   * Update the highlight flag
   * @param {Point} mouse_coords
   */
  update_highlight(mouse_coords) {
    this.show_highlight.show_flags = [this.is_hovering(mouse_coords)];
  }

  /**
   * Check if the mouse is hovering over
   * @param {Point} mouse_coords
   * @returns {boolean}
   */
  is_hovering(mouse_coords) {
    return (
      mouse_coords.sub(this.position).mag_sqr() <
      RADIUS_HIGHLIGHT * RADIUS_HIGHLIGHT
    );
  }
}
