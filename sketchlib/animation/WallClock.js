const MIN_PER_HOUR = 60;
const SEC_PER_MIN = 60;
const MS_PER_SEC = 1000;

/**
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
 * @implements {TimeSource}
 */
export class LocalTime {
  now() {
    return new Date();
  }
}

/**
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

/**
 * Extract the components from a Date object
 * @param {Date} date The date
 * @returns {{hr: number, min: number, sec: number, ms: number}}
 */
function current_time(date) {
  const hr = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();
  const ms = date.getMilliseconds();
  return { hr, min, sec, ms };
}

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

  get discrete_hours() {
    return this.time_source.now().getHours();
  }

  get continuous_hours() {
    const { hr, min, sec, ms } = current_time(this.time_source.now());

    return (
      hr +
      min / MIN_PER_HOUR +
      sec / SEC_PER_MIN / MIN_PER_HOUR +
      ms / MS_PER_SEC / SEC_PER_MIN / MIN_PER_HOUR
    );
  }

  get discrete_minutes() {
    return this.time_source.now().getMinutes();
  }

  get continuous_min() {
    const { hr, min, sec, ms } = current_time(this.time_source.now());

    return (
      hr * MIN_PER_HOUR +
      min +
      sec / SEC_PER_MIN +
      ms / MS_PER_SEC / SEC_PER_MIN
    );
  }

  get discrete_sec() {
    return this.time_source.now().getSeconds();
  }

  get continuous_sec() {
    const { hr, min, sec, ms } = current_time(this.time_source.now());
    return (
      hr * MIN_PER_HOUR * SEC_PER_MIN +
      min * SEC_PER_MIN +
      sec +
      ms / MS_PER_SEC
    );
  }

  get discrete_ms() {
    return this.time_source.now().getMilliseconds();
  }

  get continuous_ms() {
    const { hr, min, sec, ms } = current_time(this.time_source.now());
    return (
      hr * MIN_PER_HOUR * SEC_PER_MIN * MS_PER_SEC +
      min * SEC_PER_MIN * MS_PER_SEC +
      sec * MS_PER_SEC +
      ms
    );
  }
}
