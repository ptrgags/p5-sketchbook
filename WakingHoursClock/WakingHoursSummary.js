import { AnalogClock } from "../sketchlib/animation/AnalogClock.js";
import { Color } from "../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Style } from "../sketchlib/Style.js";
import { Tween } from "../sketchlib/Tween.js";
import { DEFAULT_WAKE_HOUR } from "./constants.js";
import { WakingHours } from "./WakingHours.js";
import { lerp } from "../sketchlib/lerp.js";
import { mod } from "../sketchlib/mod.js";
import { Rational } from "../sketchlib/Rational.js";

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

/**
 *
 * @param {number} hours
 * @returns {string}
 */
function format_duration(hours) {
  const hour_str = format_dec2(Math.floor(hours));

  const min = 60 * (hours % 1);
  const min_str = format_dec2(min);

  return `${hour_str}h${min_str}m`;
}

/**
 *
 * @param {number} x
 * @returns {number}
 */
function round_sixteenth(x) {
  return Math.floor(16 * x) / 16;
}

export class WakingHoursSummary {
  /**
   * Constructor
   * @param {WakingHours} state
   */
  constructor(state) {
    this.state = state;

    // These will be overwritten in the event handler
    this.tween_early_morning = Tween.scalar(-0.5, 0, 2.0, 4);
    this.tween_day = Tween.scalar(0, 1, 6, 16);
    this.tween_late_night = Tween.scalar(1.0, 1.5, 22, 4);

    this.wake_time = new TextPrimitive("Wake Time: HH:MM", new Point(10, 10));
    this.wake_duration = new TextPrimitive(
      "Duration: HH hr",
      new Point(10, 32 + 10),
    );
    this.sleep_time = new TextPrimitive(
      "Sleep Time: HH:MM",
      new Point(WIDTH - 10, 10),
    );
    this.sleep_duration = new TextPrimitive(
      "Duration: HH hr",
      new Point(WIDTH - 10, 32 + 10),
    );

    this.current_time = new TextPrimitive(
      "Current Time: HH:MM",
      new Point(10, HEIGHT - 32),
    );
    this.time_of_day = new TextPrimitive(
      "Day",
      new Point(WIDTH - 10, HEIGHT - 64),
    );
    this.fraction = new TextPrimitive(
      "Proportion: XX/YY",
      new Point(WIDTH - 10, HEIGHT - 32),
    );

    this.primitive = group(
      new GroupPrimitive(
        [this.wake_time, this.wake_duration, this.current_time],
        {
          style: STYLE_LABELS,
          text_style: TEXT_STYLE_LEFT,
        },
      ),
      new GroupPrimitive(
        [this.sleep_time, this.sleep_duration, this.time_of_day, this.fraction],
        {
          style: STYLE_LABELS,
          text_style: TEXT_STYLE_RIGHT,
        },
      ),
    );

    state.events.addEventListener("change", (e) => {
      const { wake, sleep } = /** @type {CustomEvent} */ (e).detail;

      this.wake_time.text = `Wake Time: ${format_hours(wake)}`;
      this.sleep_time.text = `Sleep Time: ${format_hours(sleep)}`;

      const sleep_after_wake = sleep < wake ? sleep + 24 : sleep;

      const mid_wake = lerp(wake, sleep_after_wake, 0.5);
      const mid_sleep = mid_wake + 12;
      const wake_duration = sleep_after_wake - wake;
      const sleep_duration = 24 - wake_duration;
      this.tween_early_morning = Tween.scalar(
        -0.5,
        0,
        mid_sleep,
        0.5 * sleep_duration,
      );
      this.tween_day = Tween.scalar(0, 1, wake, wake_duration);
      this.tween_late_night = Tween.scalar(
        1,
        1.5,
        sleep_after_wake,
        0.5 * sleep_duration,
      );

      this.sleep_duration.text = `${format_duration(sleep_duration)}`;
      this.wake_duration.text = `${format_duration(wake_duration)}`;
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

    const wake = this.state.wake_hour;
    const sleep = this.state.sleep_hour;
    const sleep_after_wake = sleep < wake ? sleep + 24 : sleep;
    const mid_wake = lerp(wake, sleep_after_wake, 0.5);
    const mid_sleep = mid_wake + 12;

    // remap the current time between wake and wake + 24 hr
    let raw_hour = clock.get_continuous_time("hr24");
    if (raw_hour < wake) {
      raw_hour += 24;
    }

    let proportion = 0;
    let is_night = false;
    if (raw_hour < sleep_after_wake) {
      proportion = this.tween_day.get_value(raw_hour);
    } else if (raw_hour < mid_sleep) {
      proportion = this.tween_late_night.get_value(raw_hour);
      is_night = true;
    } else {
      proportion = this.tween_early_morning.get_value(raw_hour);
      is_night = true;
    }
    proportion = round_sixteenth(proportion);
    const proportion_rational = new Rational(proportion * 16, 16);

    let proportion_str = proportion_rational.toString();
    if (proportion_rational.gt(Rational.ONE)) {
      const reduced = proportion_rational.sub(Rational.ONE).toString();
      proportion_str = `+${reduced}`;
    }

    let emoji = is_night ? "🌙" : "☀";

    this.fraction.text = `Proportion: ${proportion_str}${emoji}`;
  }
}
