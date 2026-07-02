import { mod } from "../sketchlib/mod.js";
import { DEFAULT_SLEEP_HOUR, DEFAULT_WAKE_HOUR } from "./constants.js";

/**
 * Load hours - from local storage if available, else the defaults defined
 * in constants.js
 * @returns {{
 *   sleep: number,
 *   wake: number
 * }} Hours from local storage, or defaults
 */
function load_hours() {
  const storage = window.localStorage;
  const sleep_str = storage.getItem("sleep") ?? DEFAULT_SLEEP_HOUR.toString();
  const wake_str = storage.getItem("wake") ?? DEFAULT_WAKE_HOUR.toString();

  const sleep = parseFloat(sleep_str);
  const wake = parseFloat(wake_str);
  return { sleep, wake };
}

/**
 * Save the hours to local storage
 * @param {number} sleep Sleep hour rounded to the nearest 0.25
 * @param {number} wake Waking hour rounded to the nearest 0.25 hour
 */
function save_hours(sleep, wake) {
  const storage = window.localStorage;
  storage.setItem("sleep", sleep.toString());
  storage.setItem("wake", wake.toString());
}

export class WakingHours {
  /**
   * Constructor
   */
  constructor() {
    const { sleep, wake } = load_hours();
    this.wake_hour = wake;
    this.sleep_hour = sleep;
    this.events = new EventTarget();
  }

  /**
   * Trigger the first state update
   */
  init() {
    this.#dispach_change();
  }

  /**
   *
   * @param {"sleep" | "wake"} sleep_or_wake
   * @param {number} hour
   */
  move_end_point(sleep_or_wake, hour) {
    if (sleep_or_wake === "sleep") {
      this.sleep_hour = hour;
    } else {
      this.wake_hour = hour;
    }
    this.#dispach_change();
  }

  /**
   *
   * @param {number} hour_diff
   */
  move_bezel(hour_diff) {
    this.wake_hour = mod(this.wake_hour + hour_diff, 24);
    this.sleep_hour = mod(this.sleep_hour + hour_diff, 24);

    this.#dispach_change();
  }

  #dispach_change() {
    save_hours(this.sleep_hour, this.wake_hour);
    this.events.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          sleep: this.sleep_hour,
          wake: this.wake_hour,
        },
      }),
    );
  }
}
