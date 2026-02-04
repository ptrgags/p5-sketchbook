import { Gap, Parallel, Sequential, TimeInterval } from "./Timeline.js";

export class RelTimelineOps {
  /**
   * Iterate over the timeline, including the gaps
   * @template {import("./Timeline.js").TimeInterval} T
   * @param {import("./Timeline.js").Timeline<T>} timeline
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
   * Iterate over the timeline, including the gaps
   * @template T
   * @param {import("./Timeline.js").Timeline<T>} timeline
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
}
