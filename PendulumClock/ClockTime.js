export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const MAX_HOURS = 12;

/**
 * Simpler interface for a 12-hour clock time in the local timezone.
 */
export class ClockTime {
  /**
   * Constructor
   * @param {number} hours Integer number of hours
   * @param {number} minutes Integer number of minutes
   * @param {number} seconds Integer number of seconds
   * @param {number} milliseconds Integr number of milliseconds
   */
  constructor(hours, minutes, seconds, milliseconds) {
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
    this.milliseconds = milliseconds;
  }

  get total_seconds() {
    return (
      this.hours * SECONDS_PER_HOUR +
      this.minutes * SECONDS_PER_MINUTE +
      this.seconds
    );
  }

  get hour_percent() {
    const total_hours =
      this.hours +
      this.minutes / MINUTES_PER_HOUR +
      this.seconds / SECONDS_PER_HOUR;
    return total_hours / MAX_HOURS;
  }

  /**
   * Get the percentage around the clock for the minute hand
   */
  get minute_percent() {
    const total_minutes = this.minutes + this.seconds / SECONDS_PER_MINUTE;
    return total_minutes / MINUTES_PER_HOUR;
  }

  /**
   * Get the percentage around the clock for the second hand
   * @type {number}
   */
  get second_percent() {
    // The second hand returns to 12 once a minute
    return this.seconds / SECONDS_PER_MINUTE;
  }

  /**
   * Get a clock time from a JS Date object
   * @param {Date} date The selected date
   * @returns {ClockTime} The specified date as a ClockTime
   */
  static from_date(date) {
    const hours = date.getHours() % MAX_HOURS;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();
    return new ClockTime(hours, minutes, seconds, milliseconds);
  }

  /**
   * Get the current time as a ClockTime (local)
   * @returns {ClockTime} The current clock time
   */
  static now() {
    const date = new Date();
    return ClockTime.from_date(date);
  }
}
