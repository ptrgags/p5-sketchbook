import { AnalogClock } from "../sketchlib/animation/AnalogClock.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { mod } from "../sketchlib/mod.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { ShowHidePrimitive } from "../sketchlib/primitives/ShowHidePrimitive.js";
import { Style } from "../sketchlib/Style.js";
import { compute_hour } from "./clock_math.js";
import {
  COLOR_HIGHLIGHT,
  COLOR_SLEEP,
  COLOR_WAKE,
  DIAL_RADIUS,
} from "./constants.js";
import { WakingHours } from "./WakingHours.js";

const BEZEL_THICKNESS = 30;

const STYLE_HIGHLIGHT = new Style({
  stroke: COLOR_HIGHLIGHT,
  width: BEZEL_THICKNESS,
});

const STYLE_WAKE = new Style({
  // Orange
  stroke: COLOR_WAKE,
  width: 8,
});
const STYLE_SLEEP = new Style({
  // Purple
  stroke: COLOR_SLEEP,
  width: 8,
});

const HIGHLIGHT_CIRCLE = style(
  new Circle(SCREEN_CENTER, DIAL_RADIUS),
  STYLE_HIGHLIGHT,
);

export class Bezel {
  /**
   * Constructor
   * @param {WakingHours} state
   */
  constructor(state) {
    this.state = state;
    this.reference_hour = 0;

    this.arc_wake = new ArcPrimitive(
      SCREEN_CENTER,
      DIAL_RADIUS,
      new ArcAngles(0, Math.PI),
    );
    this.arc_sleep = new ArcPrimitive(
      SCREEN_CENTER,
      DIAL_RADIUS,
      new ArcAngles(Math.PI, 2 * Math.PI),
    );

    this.highlight = new ShowHidePrimitive([HIGHLIGHT_CIRCLE], [false]);
    this.primitive = group(
      this.highlight,
      style(this.arc_sleep, STYLE_SLEEP),
      style(this.arc_wake, STYLE_WAKE),
    );

    this.state.events.addEventListener("change", (e) => {
      const { sleep, wake } = /** @type {CustomEvent} */ (e).detail;

      const angles_wake = new ArcAngles(
        AnalogClock.compute_angle(wake, 24),
        AnalogClock.compute_angle(sleep, 24),
      );
      const angles_sleep = angles_wake.complement();

      this.arc_wake.angles = angles_wake;
      this.arc_sleep.angles = angles_sleep;
    });
  }

  /**
   * Update the bezel highlight
   * @param {boolean} show_highlight
   */
  update_highlight(show_highlight) {
    this.highlight.show_flags = [show_highlight];
  }

  /**
   * Check if the mouse is over the bezel circle
   * @param {Point} mouse_coords
   * @returns {boolean}
   */
  is_hovering(mouse_coords) {
    const dist_center = mouse_coords.dist(SCREEN_CENTER);

    return Math.abs(dist_center - DIAL_RADIUS) < 0.5 * BEZEL_THICKNESS;
  }

  /**
   *
   * @param {Point} mouse_coords
   */
  select(mouse_coords) {
    this.reference_hour = compute_hour(mouse_coords);
  }

  /**
   *
   * @param {Point} mouse_coords
   */
  move(mouse_coords) {
    const mouse_hour = compute_hour(mouse_coords);
    const hour_diff = mod(mouse_hour - this.reference_hour, 24);
    this.reference_hour = mouse_hour;
    this.state.move_bezel(hour_diff);
  }
}
