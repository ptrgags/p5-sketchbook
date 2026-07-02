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
import { DEFAULT_SLEEP_HOUR, DEFAULT_WAKE_HOUR } from "./constants.js";
import { WakingHours } from "./WakingHours.js";
import { lerp } from "../sketchlib/lerp.js";
import { mod } from "../sketchlib/mod.js";
import { Rational } from "../sketchlib/Rational.js";

const MARGIN = 10;

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
 * Format a time rounded to the nearest 15 min as HH:MM
 * @param {number} hours The continuous number of hours
 * @returns {string} String of the form HH:MM
 */
function format_hours(hours) {
  const hour_str = format_dec2(Math.floor(hours));

  const min = 60 * (hours % 1);
  const min_str = format_dec2(min);

  return `${hour_str}:${min_str}`;
}

/**
 * Format a duration as HHhMMm, rounded to the nearest 15 min
 * @param {number} hours The continuous number of hours
 * @returns {string} String of the form HHhMMm
 */
function format_duration(hours) {
  const hour_str = format_dec2(Math.floor(hours));

  const min = 60 * (hours % 1);
  const min_str = format_dec2(min);

  return `${hour_str}h${min_str}m`;
}

/**
 * Format proportions. Late night is renumbered from 0 and marked with a +.
 * Early morning is renumbered with negative fractions
 * @param {number} proportion The proportion
 * @returns {string} a fraction, -a/b for early morning, a/b during the day (between 0 and 1) and +a/b for late night
 */
function format_proportion(proportion) {
  const sixteenths = Math.floor(16 * proportion);
  const rational = new Rational(sixteenths, 16);

  // for negative values and values up to one, return the fraction with the
  // usual proportion
  if (rational.le(Rational.ONE)) {
    return rational.toString();
  }

  const reduced = rational.sub(Rational.ONE);
  return `+${reduced}`;
}

/**
 * Several text labels at the top and bottom of the screen to show the
 * current time and sleep/wake settings
 */
export class WakingHoursSummary {
  /**
   * Constructor
   * @param {WakingHours} state
   */
  constructor(state) {
    this.state = state;

    // These times will be updated in the first state changed event
    this.wake = 0;
    this.sleep_after_wake = 0;
    this.mid_wake = 0;
    this.mid_sleep = 0;
    this.wake_duration = 0;
    this.sleep_duration = 0;

    // Three different tweens that together map [wake, wake + 24] -> a fraction
    // however daytime, late night, and early morning are handled piecewise.
    // these will be set in the first state changed event
    this.tween_early_morning = Tween.scalar(0, 1, 0, 1);
    this.tween_day = Tween.scalar(0, 1, 0, 1);
    this.tween_late_night = Tween.scalar(0, 1, 0, 1);

    this.label_wake_time = new TextPrimitive(
      "Wake Time: HH:MM",
      new Point(MARGIN, MARGIN),
    );
    this.label_wake_duration = new TextPrimitive(
      "HHhMMm",
      new Point(MARGIN, 32 + MARGIN),
    );
    this.label_sleep_time = new TextPrimitive(
      "Sleep Time: HH:MM",
      new Point(WIDTH - MARGIN, MARGIN),
    );
    this.label_sleep_duration = new TextPrimitive(
      "HHhrMMm",
      new Point(WIDTH - MARGIN, 32 + MARGIN),
    );

    this.label_current_time = new TextPrimitive(
      "Current Time: HH:MM",
      new Point(MARGIN, HEIGHT - 32),
    );
    this.label_time_of_day = new TextPrimitive(
      "Day",
      new Point(WIDTH - MARGIN, HEIGHT - 64),
    );
    this.label_fraction = new TextPrimitive(
      "Proportion: XX/YY",
      new Point(WIDTH - MARGIN, HEIGHT - 32),
    );

    this.primitive = group(
      new GroupPrimitive(
        [
          this.label_wake_time,
          this.label_wake_duration,
          this.label_current_time,
        ],
        {
          style: STYLE_LABELS,
          text_style: TEXT_STYLE_LEFT,
        },
      ),
      new GroupPrimitive(
        [
          this.label_sleep_time,
          this.label_sleep_duration,
          this.label_time_of_day,
          this.label_fraction,
        ],
        {
          style: STYLE_LABELS,
          text_style: TEXT_STYLE_RIGHT,
        },
      ),
    );

    state.events.addEventListener("change", (e) => {
      const { sleep, wake } = /** @type {CustomEvent} */ (e).detail;

      this.#update_sleep_wake_times(sleep, wake);
      this.#update_tweens();

      this.label_wake_time.text = `Wake Time: ${format_hours(wake)}`;
      this.label_sleep_time.text = `Sleep Time: ${format_hours(sleep)}`;

      this.label_sleep_duration.text = `${format_duration(this.sleep_duration)}`;
      this.label_wake_duration.text = `${format_duration(this.wake_duration)}`;
    });
  }

  /**
   * Update the sleep/wake hours and derived quantities
   * @param {number} sleep Sleep time from the state
   * @param {number} wake Wake time from the state
   */
  #update_sleep_wake_times(sleep, wake) {
    this.wake = wake;
    this.sleep_after_wake = sleep < wake ? sleep + 24 : sleep;
    this.mid_wake = lerp(wake, this.sleep_after_wake, 0.5);
    this.mid_sleep = this.mid_wake + 12;
    this.wake_duration = this.sleep_after_wake - wake;
    this.sleep_duration = 24 - this.wake_duration;
  }

  #update_tweens() {
    this.tween_early_morning = Tween.scalar(
      -0.5,
      0,
      this.mid_sleep,
      0.5 * this.sleep_duration,
    );
    this.tween_day = Tween.scalar(0, 1, this.wake, this.wake_duration);
    this.tween_late_night = Tween.scalar(
      1,
      1.5,
      this.sleep_after_wake,
      0.5 * this.sleep_duration,
    );
  }

  /**
   * Update all the time labels
   * @param {AnalogClock} clock The clock for getting the clock time
   */
  update_time(clock) {
    const hour = clock.get_discrete_time("hr24");
    const min = clock.get_discrete_time("min");
    const sec = clock.get_discrete_time("sec");
    this.label_current_time.text = `Current Time: ${format_dec2(hour)}:${format_dec2(min)}:${format_dec2(sec)}`;

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
    if (raw_hour < sleep_after_wake) {
      proportion = this.tween_day.get_value(raw_hour);
      this.label_time_of_day.text = "Daytime ☀";
    } else if (raw_hour < mid_sleep) {
      proportion = this.tween_late_night.get_value(raw_hour);
      this.label_time_of_day.text = "Late Night 🌙";
    } else {
      proportion = this.tween_early_morning.get_value(raw_hour);
      this.label_time_of_day.text = "Early Morning 🌙";
    }

    this.label_fraction.text = `Proportion: ${format_proportion(proportion)}`;
  }
}
