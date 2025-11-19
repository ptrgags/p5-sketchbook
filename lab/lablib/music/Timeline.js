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

  get duration() {
    return this.children.reduce((accum, x) => {
      return accum.add(x.duration);
    }, Rational.ZERO);
  }

  /**
   * Make a sequence by repeating a timeline N times
   * @template {TimeInterval} T the event type
   * @param {Timeline<T> | Timeline<T>[]} children
   * @param {number} repeats Integer number of repeats
   */
  static from_repeat(children, repeats) {
    const repeated = [];

    if (!Array.isArray(children)) {
      children = [children];
    }
    for (let i = 0; i < repeats; i++) {
      repeated.push(...children);
    }
    return new Sequential(...repeated);
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
