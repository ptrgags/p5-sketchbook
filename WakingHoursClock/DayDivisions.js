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

/**
 *
 * @param {ArcAngles} angles
 * @param {number} subdivisions
 * @param {number} length
 * @returns {LineSegment[]}
 */
function compute_lines(angles, subdivisions, length) {
  const lines = [];
  for (let i = 0; i < subdivisions; i++) {
    const angle = lerp(angles.start_angle, angles.end_angle, i / subdivisions);
    const dir = Direction.from_angle(angle);
    const outer_point = DIAL_CENTER.add(dir.scale(DIAL_RADIUS));
    const inner_point = DIAL_CENTER.add(dir.scale(DIAL_RADIUS - length));
    lines.push(new LineSegment(outer_point, inner_point));
  }
  return lines;
}

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
    const day_angles = new ArcAngles(wake_angle, sleep_angle);
    const night_angles = day_angles.complement();

    const day_lines2 = compute_lines(day_angles, 2, 1.25 * HASH_LENGTH);
    const day_lines4 = compute_lines(day_angles, 4, HASH_LENGTH);
    const day_lines8 = compute_lines(day_angles, 8, 0.75 * HASH_LENGTH);
    const day_lines16 = compute_lines(day_angles, 16, 0.5 * HASH_LENGTH);

    const night_lines2 = compute_lines(night_angles, 2, 1.25 * HASH_LENGTH);
    const night_lines8 = compute_lines(night_angles, 8, 0.5 * HASH_LENGTH);

    this.divisions.regroup(
      ...day_lines16,
      ...day_lines8,
      ...day_lines4,
      ...day_lines2,
      ...night_lines8,
      ...night_lines2,
    );
  }
}
