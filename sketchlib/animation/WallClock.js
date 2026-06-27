const MIN_PER_HOUR = 60;
const SEC_PER_MIN = 60;
const MS_PER_SEC = 1000;

/**
 * An object that can produce a Date for the current local time
 * @interface TimeSource
 */
export class TimeSource {
  /**
   * @returns {Date}
   */
  now() {
    throw new Error("not implemented");
  }
}

/**
 * Default implementation of TimeSource, it just returns a Date object
 * @implements {TimeSource}
 */
export class LocalTime {
  now() {
    return new Date();
  }
}

/**
 * For taking screenshots and unit tests, it's sometimes helpful to hardcode
 * the time.
 * @implements {TimeSource}
 */
export class FixedTime {
  /**
   * Constructor
   * @param {Date} time A time that will be held constant
   */
  constructor(time) {
    this.time = time;
  }

  now() {
    return this.time;
  }
}

const SUBDIVISIONS = {
  hr: 12,
  hr24: 24,
  min: 60,
  sec: 60,
  ms: 1000,
};

/**
 * Similar to Clock, but measures time since midnight instead of using performance.now().
 * It also provides multiple ways of accessing the time for animating clocks.
 *
 * This clock is also configurable to return the result in seconds or minutes
 */
export class WallClock {
  /**
   * @param {TimeSource} [time_source] Time source. If not present, creates a LocalTime object
   */
  constructor(time_source) {
    this.time_source = time_source ?? new LocalTime();
  }

  /**
   * Get the time in discrete ticks, as you would see in a digital clock
   * @param {"hr" | "hr24" | "min" | "sec" | "ms"} unit Which time unit to use
   * @returns {number}
   */
  get_discrete_time(unit) {
    const date = this.time_source.now();
    switch (unit) {
      case "hr":
        return date.getHours() % 12;
      case "hr24":
        return date.getHours();
      case "min":
        return date.getMinutes();
      case "sec":
        return date.getSeconds();
      case "ms":
        return date.getMilliseconds();
    }
  }

  /**
   * Get the clockwise angle (measured from 0 at the x-axis) for rendering
   * the selected part of the time
   * @param {"hr" | "hr24" | "min" | "sec" | "ms"} unit Which time unit to use
   * @returns {number} The angle in radians
   */
  get_discrete_angle(unit) {
    const time = this.get_discrete_time(unit);
    const subdivision = SUBDIVISIONS[unit];
    const index = time % subdivision;

    return WallClock.compute_angle(index, subdivision);
  }

  /**
   * Get the time as a continuous value, accounting for the other values
   * @param {"hr" | "hr24" | "min" | "sec" | "ms"} unit Which time unit to use
   * @returns {number}
   */
  get_continuous_time(unit) {
    const date = this.time_source.now();
    const hr = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    const ms = date.getMilliseconds();
    switch (unit) {
      case "hr":
        return (
          (hr % 12) +
          min / MIN_PER_HOUR +
          sec / SEC_PER_MIN / MIN_PER_HOUR +
          ms / MS_PER_SEC / SEC_PER_MIN / MIN_PER_HOUR
        );
      case "hr24":
        return (
          hr +
          min / MIN_PER_HOUR +
          sec / SEC_PER_MIN / MIN_PER_HOUR +
          ms / MS_PER_SEC / SEC_PER_MIN / MIN_PER_HOUR
        );
      case "min":
        return (
          hr * MIN_PER_HOUR +
          min +
          sec / SEC_PER_MIN +
          ms / MS_PER_SEC / SEC_PER_MIN
        );
      case "sec":
        return (
          hr * MIN_PER_HOUR * SEC_PER_MIN +
          min * SEC_PER_MIN +
          sec +
          ms / MS_PER_SEC
        );
      case "ms":
        return (
          hr * MIN_PER_HOUR * SEC_PER_MIN * MS_PER_SEC +
          min * SEC_PER_MIN * MS_PER_SEC +
          sec * MS_PER_SEC +
          ms
        );
    }
  }

  /**
   * Get the clockwise angle (measured from 0 at the x-axis) for rendering
   * the selected part of the time
   * @param {"hr" | "hr24" | "min" | "sec" | "ms"} unit Which time unit to use
   * @returns {number} The angle in radians
   */
  get_continuous_angle(unit) {
    const time = this.get_continuous_time(unit);
    const subdivision = SUBDIVISIONS[unit];
    const index = time % subdivision;

    return WallClock.compute_angle(index, subdivision);
  }

  /**
   * Compute a clockwise angle from the x-axis where a position on the clock
   * will appear.
   * @param {number} index Which tick number (e.g. 5 for 5:00). Ticks are counted from midnight clockwise
   * @param {number} subdivision How many ticks for this unit of time. E.g. 12 for hours, 60 for minutes
   * @returns {number}
   */
  static compute_angle(index, subdivision) {
    const MIDNIGHT = -Math.PI / 2;
    return MIDNIGHT + (index * (2.0 * Math.PI)) / subdivision;
  }
}
