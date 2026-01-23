import { Rational } from "../Rational.js";
import { Gap, Parallel, Sequential } from "./Timeline.js";

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

    if (this.children.length > 0) {
      this.start_time = this.children[0].start_time;
      this.end_time = this.children.at(-1).end_time;
    } else {
      this.start_time = Rational.ZERO;
      this.end_time = Rational.ZERO;
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

    if (this.children.length > 0) {
      this.start_time = this.children[0].start_time;
      this.end_time = this.children.reduce(
        (accum, x) => accum.max(x.end_time),
        Rational.ZERO,
      );
    } else {
      this.start_time = Rational.ZERO;
      this.end_time = Rational.ZERO;
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

/**
 * Merge an interval into a timeline, fitting it in as
 * tightly as possible. This is intended to be used with
 * a reduce call
 * @template T
 * @param {AbsTimeline<T>} timeline The accumulated timeline
 * @param {AbsInterval<T>} interval The interval to merge in
 * @returns {AbsTimeline<T>} The merged timeline
 */
function merge_interval(timeline, interval) {
  return new AbsSequential(timeline, interval);
}

export class AbsTimelineOps {
  /**
   * @template {import("./Timeline.js").TimeInterval} T
   * @param {import("./Timeline.js").Timeline<T>} rel_timeline Relative timeline to convert
   * @param {Rational} [start_time=Rational.ZERO] Start time for the timeline (often zero)
   * @return {AbsTimeline<T>} Timeline
   */
  static from_relative(rel_timeline, start_time = Rational.ZERO) {
    if (rel_timeline instanceof Gap) {
      return new AbsGap(start_time, start_time.add(rel_timeline.duration));
    } else if (rel_timeline instanceof Sequential) {
      let start = start_time;
      const children = [];
      for (const child of rel_timeline.children) {
        const abs_child = AbsTimelineOps.from_relative(child, start);
        children.push(abs_child);
        start = start.add(child.duration);
      }
      return new AbsSequential(...children);
    } else if (rel_timeline instanceof Parallel) {
      return new AbsParallel(
        ...rel_timeline.children.map((x) =>
          AbsTimelineOps.from_relative(x, start_time),
        ),
      );
    } else {
      // Plain interval
      return new AbsInterval(
        rel_timeline,
        start_time,
        start_time.add(rel_timeline.duration),
      );
    }
  }

  /**
   * Take a list of intervals, and merge them into a single timeline.
   * This is used e.g. for
   * @template T
   * @param {AbsInterval<T>[]} intervals Intervals to merge
   * @return {AbsTimeline<T>}
   */
  static from_intervals(intervals) {
    return AbsGap.ZERO;
  }
}
