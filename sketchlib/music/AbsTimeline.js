import { Rational } from "../Rational.js";
import { Gap, Parallel, Sequential, timeline_map } from "./Timeline.js";

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
}

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

    if (this.children.length > 0) {
      this.start_time = this.children[0].start_time;
      this.end_time = this.children.at(-1).end_time;
    } else {
      this.start_time = Rational.ZERO;
      this.end_time = Rational.ZERO;
    }

    this.duration = this.end_time.sub(this.start_time);
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

    // TODO: check that children all have the same start time?

    if (this.children.length > 0) {
      this.start_time = this.children[0];
      this.end_time = this.children.reduce(
        (accum, x) => accum.max(x.duration),
        Rational.ZERO,
      );
    } else {
      this.start_time = Rational.ZERO;
      this.end_time = Rational.ZERO;
    }

    this.duration = this.end_time.sub(this.start_time);
  }
}

/**
 * @template T
 * @typedef {AbsInterval<T> | AbsGap | AbsSequential<T> | AbsParallel<T>} AbsTimeline<T>
 */

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
}
