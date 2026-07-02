import { AnalogClock } from "../sketchlib/animation/AnalogClock.js";
import { Color } from "../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Style } from "../sketchlib/Style.js";
import { WakingHours } from "./WakingHours.js";

const STYLE_LABELS = new Style({
  fill: Color.WHITE,
});

const TEXT_STYLE_LEFT = new TextStyle(24, "left", "top");
const TEXT_STYLE_RIGHT = new TextStyle(24, "right", "top");

/**
 * Format a number padded to 2 decimal places with leading 0s
 * @param {number} x
 * @return {string}
 */
function format_dec2(x) {
  return x.toString().padStart(2, "0");
}

/**
 *
 * @param {number} hours
 * @returns {string}
 */
function format_hours(hours) {
  const hour_str = format_dec2(Math.floor(hours));

  const min = 60 * (hours % 1);
  const min_str = format_dec2(min);

  return `${hour_str}:${min_str}`;
}

export class WakingHoursSummary {
  /**
   * Constructor
   * @param {WakingHours} state
   */
  constructor(state) {
    this.state = state;

    this.wake_time = new TextPrimitive("Wake Time: HH:MM", new Point(10, 10));
    this.sleep_time = new TextPrimitive(
      "Sleep Time: HH:MM",
      new Point(WIDTH - 10, 10),
    );
    this.current_time = new TextPrimitive(
      "Current Time: HH:MM",
      new Point(10, HEIGHT - 32),
    );

    this.primitive = group(
      new GroupPrimitive([this.wake_time, this.current_time], {
        style: STYLE_LABELS,
        text_style: TEXT_STYLE_LEFT,
      }),
      new GroupPrimitive([this.sleep_time], {
        style: STYLE_LABELS,
        text_style: TEXT_STYLE_RIGHT,
      }),
    );

    state.events.addEventListener("change", (e) => {
      const { wake, sleep } = /** @type {CustomEvent} */ (e).detail;

      this.wake_time.text = `Wake Time: ${format_hours(wake)}`;
      this.sleep_time.text = `Sleep Time: ${format_hours(sleep)}`;
    });
  }

  /**
   *
   * @param {AnalogClock} clock
   */
  update_time(clock) {
    const hour = clock.get_discrete_time("hr24");
    const min = clock.get_discrete_time("min");
    const sec = clock.get_discrete_time("sec");
    this.current_time.text = `Current Time: ${format_dec2(hour)}:${format_dec2(min)}:${format_dec2(sec)}`;
  }
}
