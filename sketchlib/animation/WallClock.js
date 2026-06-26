const MIN_PER_HOUR = 60;
const SEC_PER_MIN = 60;
const MS_PER_SEC = 1000;

/**
 * Get the current time as components
 * @returns {{hr: number, min: number, sec: number, ms: number}}
 */
function current_time() {
  const date = new Date();
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
  get discrete_hours() {
    return new Date().getHours();
  }

  get continuous_hours() {
    const { hr, min, sec, ms } = current_time();

    return (
      hr +
      min / MIN_PER_HOUR +
      sec / SEC_PER_MIN / MIN_PER_HOUR +
      ms / MS_PER_SEC / SEC_PER_MIN / MIN_PER_HOUR
    );
  }

  get discrete_minutes() {
    return new Date().getMinutes();
  }

  get continuous_min() {
    const { hr, min, sec, ms } = current_time();

    return (
      hr * MIN_PER_HOUR +
      min +
      sec / SEC_PER_MIN +
      ms / MS_PER_SEC / SEC_PER_MIN
    );
  }

  get discrete_sec() {
    return new Date().getSeconds();
  }

  get continuous_sec() {
    const { hr, min, sec, ms } = current_time();
    return (
      hr * MIN_PER_HOUR * SEC_PER_MIN +
      min * SEC_PER_MIN +
      sec +
      ms / MS_PER_SEC
    );
  }

  get discrete_ms() {
    return new Date().getMilliseconds();
  }

  get continuous_ms() {
    const { hr, min, sec, ms } = current_time();
    return (
      hr * MIN_PER_HOUR * SEC_PER_MIN * MS_PER_SEC +
      min * SEC_PER_MIN * MS_PER_SEC +
      sec * MS_PER_SEC +
      ms
    );
  }
}
