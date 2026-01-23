import { Abs } from "tone";
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

/**
 * Concat timelines, adding an AbsGap in between if needed
 * @template T
 * @param {AbsTimeline<T>} a First timeline
 * @param {AbsTimeline<T>} b second timeline
 * @returns {AbsSequential<T>} The concatenated timeline
 */
function concat_timelines(a, b) {
  if (a.end_time.equals(b.start_time)) {
    return new AbsSequential(a, b);
  }

  const gap = new AbsGap(a.end_time, b.start_time);
  return new AbsSequential(a, gap, b);
}

/**
 * Fit an interval inside a parallel, in the first channel that fits.
 * @template T
 * @param {AbsParallel<T>} parallel The accumulator
 * @param {AbsInterval<T>} interval The interval to add
 */
function fit_parallel(parallel, interval) {
  for (const [i, child] of parallel.children.entries()) {
    if (child.end_time.is_less_than(interval.start_time)) {
      return new AbsParallel(
        ...parallel.children.slice(0, i),
        concat_timelines(child, interval),
        ...parallel.children.slice(i + 1),
      );
    }
  }

  // There wasn't a free space, so add a new channel
  return new AbsParallel(...parallel.children, interval);
}

/**
 * Merge an interval into a timeline, fitting it in as
 * tightly as possible. This is intended to be used with
 * a reduce call.
 *
 * This assumes that the intervals are passed in sorted
 * by start time
 * @template T
 * @param {AbsTimeline<T>} timeline The accumulated timeline
 * @param {AbsInterval<T>} interval The interval to merge in.
 * @returns {AbsTimeline<T>} The merged timeline
 */
function merge_interval(timeline, interval) {
  // The calling function passes in AbsGap.ZERO to start
  // the accumulator so the correct type is reduced
  if (timeline.duration.equals(Rational.ZERO)) {
    return interval;
  }

  // If there's no overlap, concatenate the timelines
  // in an AbsSequential
  if (!interval.start_time.is_less_than(timeline.end_time)) {
    return concat_timelines(timeline, interval);
  }

  // If we got here, interval overlaps the timeline. We need
  // to make the parallel, but the algorithm is different if
  // we already had a parallel.
  if (timeline instanceof AbsParallel) {
    return fit_parallel(timeline, interval);
  }

  /**
   * @type {AbsTimeline<T>}
   */
  let padded = interval;
  if (!timeline.start_time.equals(interval.start_time)) {
    padded = new AbsSequential(
      new AbsGap(timeline.start_time, interval.start_time),
      interval,
    );
  }

  return new AbsParallel(timeline, padded);
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
    if (intervals.length === 0) {
      return AbsGap.ZERO;
    }

    if (intervals.length === 1) {
      return intervals[0];
    }

    return intervals.reduce(
      (acc, interval) => merge_interval(acc, interval),
      AbsGap.ZERO,
    );
  }
}
