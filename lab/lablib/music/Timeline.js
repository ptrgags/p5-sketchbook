import { Rational } from "../Rational.js";

/**
 * @typedef {{duration: Rational}} TimeInterval
 */

/**
 * A gap in the timeline. This is mostly needed inside containers to
 * space out events as desired.
 */
export class Gap {
  /**
   * Constructor
   * @param {Rational} duration How long to rest
   */
  constructor(duration) {
    this.duration = duration;
  }

  /**
   * A gap doesn't have an inner type, so map is just the identity
   * @return {Gap}
   */
  map() {
    return this;
  }
}

/**
 * A sequence of events in time
 * @template {TimeInterval} T The event type
 */
export class Sequential {
  /**
   * Constructor
   * @param {...Timeline<T>} children Inner events
   */
  constructor(...children) {
    this.children = children;
  }

  /**
   * Compute the duration as the sum of the children durations
   * @type {Rational}
   */
  get duration() {
    return this.children.reduce((accum, x) => {
      return accum.add(x.duration);
    }, Rational.ZERO);
  }

  /**
   * Make a sequence by repeating a timeline N times
   * Note that this may create nesting
   * @template {TimeInterval} T the event type
   * @param {Timeline<T>} material The material to repeat
   * @param {number} repeats Postive integer number of repeats
   * @return {Timeline<T>} if repeats === 1, material is returned as-is. if
   * repeats >1, returns a Sequential with material listed multiple times.
   */
  static from_repeat(material, repeats) {
    if (repeats < 1) {
      throw new Error("repeats must be a positive integer");
    }

    if (repeats === 1) {
      return material;
    }

    const repeated = new Array(repeats).fill(material);
    return new Sequential(...repeated);
  }

  /**
   * Similar to from_repeat, but instead of specifying the number of
   * repeats, specify the total duration to loop the clip
   * @template {TimeInterval} T the event type
   * @param {Timeline<T>} material The material to loop
   * @param {Rational} total_duration The total duration to loop in measures
   */
  static from_loop(material, total_duration) {
    const num_repeats = total_duration.div(material.duration);
    const whole_repeats = num_repeats.quotient;
    const partial_repeat = num_repeats.remainder;

    if (total_duration.equals(Rational.ZERO)) {
      throw new Error("total duration must be nonzero");
    }

    if (partial_repeat !== 0) {
      // Doing a partial loop requires cropping the material and appending
      // it to the repeat below
      throw new Error("Not yet implemented: partial loop");
    }

    return Sequential.from_repeat(material, whole_repeats);
  }
}

/**
 * Events played simultaneously.
 * @template {TimeInterval} T
 */
export class Parallel {
  /**
   * Constructor
   * @param  {...Timeline<T>} children
   */
  constructor(...children) {
    this.children = children;
  }

  /**
   * Compute the duration as the max of the children's durations
   * @type {Rational}
   */
  get duration() {
    return this.children.reduce(
      (accum, x) => accum.max(x.duration),
      Rational.ZERO
    );
  }
}

/**
 * @template {TimeInterval} T
 * @typedef {T | Gap | Sequential<T> | Parallel<T>} Timeline<T>
 */

/**
 * Map a function over a timeline.
 * @template {TimeInterval} T The original event type
 * @template {TimeInterval} U The new event type after applying f
 * @param {function(T): U} f A function to apply to each event in the timeline
 * @param {Timeline<T>} timeline The original timeline
 * @returns {Timeline<U>} A new timeline with the
 */
export function timeline_map(f, timeline) {
  if (timeline instanceof Gap) {
    return timeline;
  }

  if (timeline instanceof Sequential) {
    const children = timeline.children.map((x) => timeline_map(f, x));
    return new Sequential(...children);
  }

  if (timeline instanceof Parallel) {
    const children = timeline.children.map((x) => timeline_map(f, x));
    return new Parallel(...children);
  }

  // if it's none of the above, then it's a plain T
  return f(timeline);
}

/**
 * Take a timeline and return a list of events with absolute start/end times.
 * @template {TimeInterval} T
 * @param {Rational} offset Offset for the first event
 * @param {Timeline<T>} timeline
 * @returns {[T, Rational, Rational][]}
 */
export function to_events(offset, timeline) {
  if (timeline instanceof Gap) {
    return [];
  } else if (timeline instanceof Sequential) {
    let start = offset;
    const results = [];
    for (const child of timeline.children) {
      const events = to_events(start, child);
      results.push(...events);
      start = start.add(child.duration);
    }
    return results;
  } else if (timeline instanceof Parallel) {
    return timeline.children.flatMap((x) => to_events(offset, x));
  } else {
    // Plain interval
    const start = offset;
    const end = start.add(timeline.duration);
    return [[timeline, start, end]];
  }
}
