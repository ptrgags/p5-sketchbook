import { Rational } from "../Rational.js";
import {
  AbsGap,
  AbsInterval,
  AbsParallel,
  AbsSequential,
} from "./AbsTimeline.js";
import { Gap, Parallel, Sequential } from "./Timeline.js";

/**
 * @template T
 * @typedef {import("./AbsTimeline.js").AbsTimeline<T>} AbsTimeline
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
    if (child.end_time.le(interval.start_time)) {
      return new AbsParallel(
        ...parallel.children.slice(0, i),
        concat_timelines(child, interval),
        ...parallel.children.slice(i + 1),
      );
    }
  }

  // There wasn't a free space, so add a new channel
  if (parallel.start_time.equals(interval.start_time)) {
    return new AbsParallel(...parallel.children, interval);
  }

  // The interval starts later than the start, so insert
  // a gap in the start
  const padded = new AbsSequential(
    new AbsGap(parallel.start_time, interval.start_time),
    interval,
  );
  return new AbsParallel(...parallel.children, padded);
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
  if (!interval.start_time.lt(timeline.end_time)) {
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

// helper functions for flatten --------------------------

/**
 * Flatten a sequential recursively, combining nested sequentials together.
 * Mutually recursive with flatten_parallel
 * @template T
 * @param {AbsSequential<T>} seq Sequential timeline
 * @returns {AbsTimeline<T>} The flattened timeline.
 */
function flatten_sequential(seq) {
  const flattened = [];

  for (const child of seq.children) {
    let flat_child = child;
    if (child instanceof AbsSequential) {
      flat_child = flatten_sequential(child);
    } else if (child instanceof AbsParallel) {
      flat_child = flatten_parallel(child);
    }

    if (flat_child instanceof AbsGap && flat_child.is_empty) {
      // filter out zero gaps
      continue;
    } else if (flat_child instanceof AbsSequential) {
      flattened.push(...flat_child.children);
    } else {
      flattened.push(flat_child);
    }
  }

  // Empty timeline, so return a zero gap
  if (flattened.length === 0) {
    return AbsGap.ZERO;
  }

  // If there's only one child, no need to wrap it in a Sequential
  if (flattened.length === 1) {
    return flattened[0];
  }

  return new AbsSequential(...flattened);
}

/**
 * Flatten a parallel timeline, combining nested parallel timelines into
 * a single Parallel. Mutually recursive with flatten_sequential
 * @template T
 * @param {AbsParallel<T>} par A parallel timeline
 * @returns {AbsTimeline<T>} The flattened timeline
 */
function flatten_parallel(par) {
  const flattened = [];
  for (const child of par.children) {
    let flat_child = child;

    if (child instanceof AbsParallel) {
      flat_child = flatten_parallel(child);
    } else if (child instanceof AbsSequential) {
      flat_child = flatten_sequential(child);
    }

    if (flat_child instanceof AbsGap && flat_child.is_empty) {
      // Filter out zero gaps
      continue;
    } else if (flat_child instanceof AbsParallel) {
      flattened.push(...flat_child.children);
    } else {
      flattened.push(flat_child);
    }
  }

  if (flattened.length === 0) {
    return AbsGap.ZERO;
  }

  if (flattened.length === 1) {
    return flattened[0];
  }

  return new AbsParallel(...flattened);
}

export class AbsTimelineOps {
  /**
   * @template T
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
    }

    // TimeInterval
    return new AbsInterval(
      rel_timeline.value,
      start_time,
      start_time.add(rel_timeline.duration),
    );
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

    const sorted_intervals = intervals
      .slice()
      .sort((a, b) => a.start_time.real - b.start_time.real);

    return sorted_intervals.reduce(
      (acc, interval) => merge_interval(acc, interval),
      AbsGap.ZERO,
    );
  }

  /**
   * Flatten a timeline, removing redundant uses of AbsSequential or AbsParallel
   * @template T
   * @param {AbsTimeline<T>} timeline The original timeline
   * @returns {AbsTimeline<T>} The flattened timeline
   */
  static flatten(timeline) {
    if (timeline instanceof AbsSequential) {
      return flatten_sequential(timeline);
    }

    if (timeline instanceof AbsParallel) {
      return flatten_parallel(timeline);
    }

    return timeline;
  }
}
