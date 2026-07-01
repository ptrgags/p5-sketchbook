export class WakingHours {
  /**
   * Constructor
   * @param {number} wake_hour Wake hour (in increments of 0.25)
   * @param {number} sleep_hour Sleep hour (in increments of 0.25)
   */
  constructor(wake_hour, sleep_hour) {
    this.wake_hour = wake_hour;
    this.sleep_hour = sleep_hour;
  }
}
