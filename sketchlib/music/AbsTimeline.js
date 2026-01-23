import { Rational } from "../Rational.js";

/**
 * @template T
 */
export class AbsInterval {
  /**
   * Constructor
   * @param {T} value
   * @param {Rational} start_time Start time
   * @param {Rational} end_time End time
   */
  constructor(value, start_time, end_time) {
    this.value = value;
    this.start_time = start_time;
    this.end_time = end_time;
    this.duration = end_time.sub(start_time);
  }

  /**
   * @returns {Generator<AbsInterval<T>>}
   */
  *[Symbol.iterator]() {
    yield this;
  }
}

/**
 * @template T
 */
export class AbsGap {
  /**
   * A gap in the timeline.
   * @param {Rational} start_time
   * @param {Rational} end_time
   */
  constructor(start_time, end_time) {
    this.start_time = start_time;
    this.end_time = end_time;
    this.duration = end_time.sub(start_time);
  }

  get is_empty() {
    return this.duration.equals(Rational.ZERO);
  }

  /**
   * @returns {Generator<AbsInterval<T>>}
   */
  *[Symbol.iterator]() {
    return;
  }
}
AbsGap.ZERO = Object.freeze(new AbsGap(Rational.ZERO, Rational.ZERO));

/**
 * Check that each interval in a sequential timeline
 * ends exactly when the next one begins.
 * @template T
 * @param {AbsTimeline<T>[]} timelines
 */
function assert_no_gaps(timelines) {
  for (let i = 0; i < timelines.length - 1; i++) {
    const current = timelines[i];
    const next = timelines[i + 1];
    if (!current.end_time.equals(next.start_time)) {
      throw new Error(
        "children of AbsSequential must not have any implicit gaps",
      );
    }
  }
}

/**
 * @template T
 */
export class AbsSequential {
  /**
   * Constructor
   * @param  {...AbsTimeline<T>} children
   */
  constructor(...children) {
    this.children = children;

    assert_no_gaps(children);

    /**
     * @type {Rational}
     */
    this.start_time = Rational.ZERO;
    /**
     * @type {Rational}
     */
    this.end_time = Rational.ZERO;
    if (this.children.length > 0) {
      this.start_time = this.children[0].start_time;
      this.end_time = this.children.at(-1).end_time;
    }

    this.duration = this.end_time.sub(this.start_time);
  }

  /**
   * @returns {Generator<AbsInterval<T>>}
   */
  *[Symbol.iterator]() {
    for (const child of this.children) {
      yield* child;
    }
  }
}

/**
 * @template T
 */
export class AbsParallel {
  /**
   *
   * @param  {...AbsTimeline<T>} children Absolute children
   */
  constructor(...children) {
    this.children = children;

    if (
      children.length > 0 &&
      !children.every((x) => x.start_time.equals(children[0].start_time))
    ) {
      throw new Error(
        "children of AbsParallel must all start at the same time",
      );
    }

    /**
     * @type {Rational}
     */
    this.start_time = Rational.ZERO;
    /**
     * @type {Rational}
     */
    this.end_time = Rational.ZERO;
    if (this.children.length > 0) {
      this.start_time = this.children[0].start_time;
      this.end_time = this.children.reduce(
        (accum, x) => accum.max(x.end_time),
        Rational.ZERO,
      );
    }

    this.duration = this.end_time.sub(this.start_time);
  }

  /**
   * @returns {Generator<AbsInterval<T>>}
   */
  *[Symbol.iterator]() {
    const sorted_intervals = this.children
      .flatMap((child) => {
        return [...child];
      })
      .sort((a, b) => a.start_time.real - b.start_time.real);
    yield* sorted_intervals;
  }
}

/**
 * @template T
 * @typedef {AbsInterval<T> | AbsGap | AbsSequential<T> | AbsParallel<T>} AbsTimeline<T>
 */
