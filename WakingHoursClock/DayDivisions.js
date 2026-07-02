import { AnalogClock } from "../sketchlib/animation/AnalogClock.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { lerp } from "../sketchlib/lerp.js";
import {
  COLOR_HIGHLIGHT,
  DIAL_CENTER,
  DIAL_RADIUS,
  HASH_LENGTH,
} from "./constants.js";
import { WakingHours } from "./WakingHours.js";

const STYLE_DIVISION_TICK = new Style({
  stroke: COLOR_HIGHLIGHT,
  width: 4,
});

export class DayDivisions {
  /**
   * Constructor
   * @param {WakingHours} state
   */
  constructor(state) {
    this.divisions = group();
    this.primitive = style(this.divisions, STYLE_DIVISION_TICK);

    state.events.addEventListener("change", (e) => {
      const { sleep, wake } = /** @type {CustomEvent} */ (e).detail;
      this.#compute_subdivisions(sleep, wake);
    });
  }

  /**
   * Recompute the tick marks for the day subdivisions
   * @param {number} sleep_hour
   * @param {number} wake_hour
   */
  #compute_subdivisions(sleep_hour, wake_hour) {
    const wake_angle = AnalogClock.compute_angle(wake_hour, 24);
    const sleep_angle = AnalogClock.compute_angle(sleep_hour, 24);
    const angles = new ArcAngles(wake_angle, sleep_angle);

    const wake_lines = [];
    for (let i = 0; i <= 8; i++) {
      const angle = lerp(angles.start_angle, angles.end_angle, i / 8);
      const dir = Direction.from_angle(angle);
      const outer_point = DIAL_CENTER.add(dir.scale(DIAL_RADIUS));
      const inner_point = DIAL_CENTER.add(dir.scale(DIAL_RADIUS - HASH_LENGTH));
      wake_lines.push(new LineSegment(outer_point, inner_point));
    }

    this.divisions.regroup(...wake_lines);
  }
}
