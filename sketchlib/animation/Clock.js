const MS_PER_SEC = 1000;

/**
 * For unit testing, StubClockSource allows you to deterministically
 * determine the times
 * @private
 * @example
 * const clock_source = new StubClockSource([0, 16, 32]);
 * clock_source.now() // returns 0
 * clock_source.now() // returns 16
 * clock_source.now() // returns 32
 */
export class StubClockSource {
  /**
   * Constructor
   * @param {number[]} times_ms Times to provide to the clock in order
   */
  constructor(times_ms) {
    this.times = times_ms;
    this.cursor = 0;
  }

  now() {
    const val = this.times[this.cursor];
    this.cursor++;

    if (val === undefined) {
      throw new Error("not enough time values provided");
    }
    return val;
  }
}

/**
 * Elapsed time clock.
 */
export class Clock {
  /**
   * Constructor
   * @param {{now(): number}} clock_source a source of time in milliseconds. Usually performance is used, but for unit tests StubClockSource can be used
   */
  constructor(clock_source = performance) {
    this.clock_source = clock_source;
    this.start_time = clock_source.now();
  }

  /**
   * Reset the clock with the current time
   */
  reset() {
    this.start_time = this.clock_source.now();
  }

  /**
   * Get the elapsed time since construction or last reset in seconds
   * @type {number}
   */
  get elapsed_time() {
    const now = this.clock_source.now();
    const time_ms = now - this.start_time;

    return time_ms / MS_PER_SEC;
  }
}
