const MIN_PER_HOUR = 60;
const SEC_PER_MIN = 60;
const MS_PER_SEC = 1000;

const TIME_CONVERSIONS = {
  /**
   *
   * @param {number} hr
   * @param {number} min
   * @param {number} sec
   * @param {number} ms
   * @return {number}
   */
  to_hr(hr, min, sec, ms) {
    return (
      hr +
      min / MIN_PER_HOUR +
      sec / SEC_PER_MIN / MIN_PER_HOUR +
      ms / MS_PER_SEC / SEC_PER_MIN / MIN_PER_HOUR
    );
  },
  /**
   *
   * @param {number} hr
   * @param {number} min
   * @param {number} sec
   * @param {number} ms
   * @return {number}
   */
  to_min(hr, min, sec, ms) {
    return (
      hr * MIN_PER_HOUR +
      min +
      sec / SEC_PER_MIN +
      ms / MS_PER_SEC / SEC_PER_MIN
    );
  },
  /**
   *
   * @param {number} hr
   * @param {number} min
   * @param {number} sec
   * @param {number} ms
   * @return {number}
   */
  to_sec(hr, min, sec, ms) {
    return (
      hr * MIN_PER_HOUR * SEC_PER_MIN +
      min * SEC_PER_MIN +
      sec +
      ms / SEC_PER_MIN
    );
  },
  /**
   *
   * @param {number} hr
   * @param {number} min
   * @param {number} sec
   * @param {number} ms
   * @return {number}
   */
  to_ms(hr, min, sec, ms) {
    return (
      hr * MIN_PER_HOUR * SEC_PER_MIN * MS_PER_SEC +
      min * SEC_PER_MIN * MS_PER_SEC +
      sec * MS_PER_SEC +
      ms
    );
  },
};

/**
 * Like Clock, but measures time since midnight instead of using performance.now()
 *
 * This clock is also configurable to return the result in seconds or minutes
 */
export class LocalClock {
  /**
   * Constructor
   * @param {"hr" | "min" | "sec" | "ms"} unit Which time division will be returned by elapsed_time
   */
  constructor(unit) {
    this.conversion_func = TIME_CONVERSIONS[`to_${unit}`];
  }

  /**
   * Get the elapsed time since local midnight. The time unit is determined by the constructor.
   *
   * NOTE: This counter may jump for daylight savings time, leap seconds, etc.
   * @type {number}
   */
  get elapsed_time() {
    const date = new Date();
    const hr = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    const ms = date.getMilliseconds();

    return this.conversion_func(hr, min, sec, ms);
  }
}
