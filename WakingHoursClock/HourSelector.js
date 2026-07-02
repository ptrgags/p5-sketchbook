import { SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { mod } from "../sketchlib/mod.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { ShowHidePrimitive } from "../sketchlib/primitives/ShowHidePrimitive.js";
import { Style } from "../sketchlib/Style.js";
import { compute_hour, compute_position } from "./clock_math.js";
import {
  COLOR_HIGHLIGHT,
  COLOR_SLEEP,
  COLOR_WAKE,
  DIAL_RADIUS,
} from "./constants.js";
import { WakingHours } from "./WakingHours.js";

const RADIUS_MARKER = 8;
const RADIUS_HIGHLIGHT = 12;

const STYLE_HIGHLIGHT = new Style({
  fill: COLOR_HIGHLIGHT,
});

export class HourSelector {
  /**
   * Constructor
   * @param {WakingHours} state current hour
   * @param {"wake" | "sleep"} sleep_or_wake Whether the marker represents
   */
  constructor(state, sleep_or_wake) {
    this.sleep_or_wake = sleep_or_wake;
    this.state = state;
    this.position = compute_position(this.hour);

    // Save the two circles so we can update the positions
    this.marker_circle = new Circle(this.position, RADIUS_MARKER);
    this.highlight_circle = new Circle(this.position, RADIUS_HIGHLIGHT);
    // also need to save a reference to the show/hide flag.
    this.show_highlight = new ShowHidePrimitive(
      [this.highlight_circle],
      [false],
    );

    const color = sleep_or_wake === "sleep" ? COLOR_SLEEP : COLOR_WAKE;
    const style_marker = new Style({
      fill: color,
    });

    this.primitive = group(
      style(this.show_highlight, STYLE_HIGHLIGHT),
      style(this.marker_circle, style_marker),
    );

    this.state.events.addEventListener("change", (e) => {
      this.position = compute_position(this.hour);

      this.marker_circle.center = this.position;
      this.highlight_circle.center = this.position;
    });
  }

  get hour() {
    if (this.sleep_or_wake === "sleep") {
      return this.state.sleep_hour;
    }

    return this.state.wake_hour;
  }

  /**
   * Update whether the highlight circle is visible
   * @param {boolean} show_highlight
   */
  update_highlight(show_highlight) {
    this.show_highlight.show_flags = [show_highlight];
  }

  /**
   * Check if the mouse is hovering over the hour drag handle
   * @param {Point} mouse_coords
   * @returns {boolean}
   */
  is_hovering(mouse_coords) {
    return (
      mouse_coords.sub(this.position).mag_sqr() <
      RADIUS_HIGHLIGHT * RADIUS_HIGHLIGHT
    );
  }

  /**
   *
   * @param {Point} mouse_coords
   */
  move(mouse_coords) {
    const hour = compute_hour(mouse_coords);
    this.state.move_end_point(this.sleep_or_wake, hour);
  }

  select = this.move;
}
