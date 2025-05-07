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
   * @type {number}
   */
  get duration() {
    return this.children.reduce((accum, x) => Math.max(accum, x.duration), 0);
  }
}

/**
 * A fixed length loop of time that is evenly divided amongst its children.
 * This is based on cycles from Tidal Cycles, but can be used for any sort
 * of event
 * @see {@link https://tidalcycles.org/docs/reference/cycles|Tidal Cycles Reference}
 * @template {TimeInterval} T
 */
export class Cycle {
  /**
   * Constructor
   * @param {Rational} duration The duration of 1 cycle
   * @param  {...Timeline<T>} children Children music objects. Each one will receive the same fraction of a cycle
   */
  constructor(duration, ...children) {
    this.duration = duration;
    this.children = children;
    this.subdivision = new Rational(1, children.length);
  }
}

/**
 * Loop a timeline. If the loop is longer than its contents,
 * the contents are played on loop for the given duration. If it is shorter
 * than its contents, events starting after the end of the loop
 * @template {TimeInterval} T
 */
export class Loop {
  /**
   * Constructor
   * @param {Rational} duration The length of the clip (this can be different than the child's duration)
   * @param {Timeline<T>} child The inner timeline
   */
  constructor(duration, child) {
    this.duration = duration;
    this.child = child;
  }
}

/**
 * @template {TimeInterval} T
 * @typedef {T | Gap | Sequential<T> | Parallel<T> | Cycle<T> | Loop<T>} Timeline<T>
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

  if (timeline instanceof Cycle) {
    const children = timeline.children.map((x) => timeline_map(f, x));
    return new Cycle(timeline.duration, ...children);
  }

  if (timeline instanceof Loop) {
    const child = timeline_map(f, timeline.child);
    return new Loop(timeline.duration, child);
  }

  // if it's none of the above, then it's a plain T
  return f(timeline);
}
