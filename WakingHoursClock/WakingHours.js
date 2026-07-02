import { mod } from "../sketchlib/mod.js";

export class WakingHours {
  /**
   * Constructor
   * @param {number} wake_hour Wake hour (in increments of 0.25)
   * @param {number} sleep_hour Sleep hour (in increments of 0.25)
   */
  constructor(wake_hour, sleep_hour) {
    this.wake_hour = wake_hour;
    this.sleep_hour = sleep_hour;
    this.events = new EventTarget();
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
