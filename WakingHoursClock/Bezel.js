import { AnalogClock } from "../sketchlib/animation/AnalogClock.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Color } from "../sketchlib/Color.js";
import { mod } from "../sketchlib/mod.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { ShowHidePrimitive } from "../sketchlib/primitives/ShowHidePrimitive.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Style } from "../sketchlib/Style.js";
import { compute_hour } from "./clock_math.js";
import {
  COLOR_HIGHLIGHT,
  COLOR_SLEEP,
  COLOR_WAKE,
  DIAL_CENTER,
  DIAL_RADIUS,
  HASH_LENGTH,
  NUMERAL_RADIUS,
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

const STYLE_NUMERALS = new Style({
  fill: Color.WHITE,
});

const STYLE_TICKS = new Style({
  stroke: Color.WHITE,
  width: 4,
});

const STYLE_MINOR_TICKS = new Style({
  stroke: Color.WHITE,
  width: 2,
});

const TICK_MARKS = Direction.roots_of_unity(24).map((dir) => {
  const outer_point = DIAL_CENTER.add(dir.scale(DIAL_RADIUS));
  const inner_point = DIAL_CENTER.add(dir.scale(DIAL_RADIUS + HASH_LENGTH));
  return new LineSegment(outer_point, inner_point);
});

const MINOR_TICKS = Direction.roots_of_unity(24 * 4).map((dir) => {
  const outer_point = DIAL_CENTER.add(dir.scale(DIAL_RADIUS));
  const inner_point = DIAL_CENTER.add(
    dir.scale(DIAL_RADIUS + HASH_LENGTH * 0.5),
  );
  return new LineSegment(outer_point, inner_point);
});

const NUMERALS = Direction.roots_of_unity(24).map((dir, i) => {
  const numeral = (i + 6) % 24;
  return new TextPrimitive(
    `${numeral}`,
    DIAL_CENTER.add(dir.scale(NUMERAL_RADIUS)),
  );
});
const TEXT_STYLE_NUMERALS = new TextStyle(25, "center", "center");

const HIGHLIGHT_CIRCLE = style(
  new Circle(DIAL_CENTER, DIAL_RADIUS),
  STYLE_HIGHLIGHT,
);

/**
 * The bezel of this clock displays two circular arcs, one for waking hours and
 * another for sleeping hours.
 *
 * When dragged with mouse/touch input, it shifts both sleep and wake times
 * by the same amount.
 */
export class Bezel {
  /**
   * Constructor
   * @param {WakingHours} state State of the cclock
   */
  constructor(state) {
    this.state = state;
    this.reference_hour = 0;

    this.arc_wake = new ArcPrimitive(
      DIAL_CENTER,
      DIAL_RADIUS,
      new ArcAngles(0, Math.PI),
    );
    this.arc_sleep = new ArcPrimitive(
      DIAL_CENTER,
      DIAL_RADIUS,
      new ArcAngles(Math.PI, 2 * Math.PI),
    );

    this.highlight = new ShowHidePrimitive([HIGHLIGHT_CIRCLE], [false]);
    this.primitive = group(
      this.highlight,
      style(MINOR_TICKS, STYLE_MINOR_TICKS),
      style(TICK_MARKS, STYLE_TICKS),

      new GroupPrimitive(NUMERALS, {
        style: STYLE_NUMERALS,
        text_style: TEXT_STYLE_NUMERALS,
      }),
      style(this.arc_sleep, STYLE_SLEEP),
      style(this.arc_wake, STYLE_WAKE),
    );

    this.state.events.addEventListener("change", (e) => {
      const { sleep, wake } = /** @type {CustomEvent} */ (e).detail;

      const angles_wake = ArcAngles.from_raw_angles(
        AnalogClock.compute_angle(wake, 24),
        AnalogClock.compute_angle(sleep, 24),
        +1,
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
   * @param {Point} mouse_coords Coordinates of the mouse
   * @returns {boolean} True if the mouse is over the area of the bezel highlight
   */
  is_hovering(mouse_coords) {
    const dist_center = mouse_coords.dist(DIAL_CENTER);

    return Math.abs(dist_center - DIAL_RADIUS) < 0.5 * BEZEL_THICKNESS;
  }

  /**
   * When the bezel is selected with the mouse, save the position as a
   * reference point so we can see how far the bezel travels in the next
   * drag event (see move())
   * @param {Point} mouse_coords
   */
  select(mouse_coords) {
    this.reference_hour = compute_hour(mouse_coords);
  }

  /**
   * When the mouse is dragged, this updates the sleep/wake times
   * @param {Point} mouse_coords
   */
  move(mouse_coords) {
    const mouse_hour = compute_hour(mouse_coords);
    const hour_diff = mod(mouse_hour - this.reference_hour, 24);
    this.reference_hour = mouse_hour;
    this.state.move_bezel(hour_diff);
  }
}
