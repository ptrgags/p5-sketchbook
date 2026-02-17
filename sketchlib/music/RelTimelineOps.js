import { Rational } from "../Rational.js";
import { Gap, Parallel, Sequential, TimeInterval } from "./Timeline.js";

/**
 * @template T
 * @typedef {import("./Timeline.js").Timeline<T>} Timeline
 */

export class RelTimelineOps {
  /**
   * Iterate over the timeline, including the gaps
   * @template T
   * @param {Timeline<T>} timeline
   * @return {number} The maximum number of parallel lanes in the timeline
   */
  static num_lanes(timeline) {
    if (timeline instanceof Gap) {
      return 0;
    }

    if (timeline instanceof Sequential) {
      return timeline.children.reduce(
        (acc, child) => Math.max(acc, RelTimelineOps.num_lanes(child)),
        0,
      );
    }

    if (timeline instanceof Parallel) {
      return timeline.children.reduce(
        (acc, child) => acc + RelTimelineOps.num_lanes(child),
        0,
      );
    }

    // individual time interval
    return 1;
  }

  /**
   * Iterate over the intervals of the timeline, filtering
   * out gaps
   * @template T
   * @param {Timeline<T>} timeline
   * @returns {Generator<TimeInterval<T>>}
   */
  static *iter_intervals(timeline) {
    for (const x of this.iter_with_gaps(timeline)) {
      if (x instanceof TimeInterval) {
        yield x;
      }
    }
  }

  /**
   * Iterate over the timeline, including the gaps
   * @template T
   * @param {Timeline<T>} timeline
   * @return {Generator<Gap | TimeInterval<T>>}
   */
  static *iter_with_gaps(timeline) {
    if (timeline instanceof Sequential) {
      for (const child of timeline.children) {
        yield* RelTimelineOps.iter_with_gaps(child);
      }
    } else if (timeline instanceof Parallel) {
      for (const child of timeline.children) {
        yield* RelTimelineOps.iter_with_gaps(child);
      }
    } else {
      yield timeline;
    }
  }

  /**
   * @template T
   * @param {Timeline<T>} timeline
   * @return {Rational}
   */
  static smallest_subdivision(timeline) {
    let subdivision = Rational.ONE;
    for (const interval of RelTimelineOps.iter_with_gaps(timeline)) {
      subdivision = subdivision.gcd(interval.duration);
    }
    throw new Error("Method not implemented.");
  }
}
