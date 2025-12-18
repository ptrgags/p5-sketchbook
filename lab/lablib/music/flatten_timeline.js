/**
 * @typedef {import("./Timeline").TimeInterval} TimeInterval
 */

import { Gap, Parallel, Sequential } from "./Timeline";

/**
 * @template {TimeInterval} T
 * @typedef {import("./Timeline").Timeline<T>} Timeline
 */

/**
 * Flatten a sequential recursively, combining nested sequentials together.
 * Mutually recursive with flatten_parallel
 * @template {TimeInterval} T
 * @param {Sequential<T>} seq Sequential timeline
 * @returns {Timeline<T>} The flattened timeline.
 */
function flatten_sequential(seq) {
  const flattened = [];

  for (const child of seq.children) {
    let flat_child = child;
    if (child instanceof Sequential) {
      flat_child = flatten_sequential(child);
    } else if (child instanceof Parallel) {
      flat_child = flatten_parallel(child);
    }

    if (flat_child instanceof Sequential) {
      flattened.push(...flat_child.children);
    } else {
      flattened.push(flat_child);
    }
  }

  // Empty timeline, so return a zero gap
  if (flattened.length === 0) {
    return Gap.ZERO;
  }

  // If there's only one child, no need to wrap it in a Sequential
  if (flattened.length === 1) {
    return flattened[0];
  }

  return new Sequential(...flattened);
}

/**
 * Flatten a parallel timeline, combining nested parallel timelines into
 * a single Parallel. Mutually recursive with flatten_sequential
 * @template {TimeInterval} T
 * @param {Parallel<T>} par A parallel timeline
 * @returns {Timeline<T>} The flattened timeline
 */
function flatten_parallel(par) {
  const flattened = [];
  for (const child of par.children) {
    let flat_child = child;

    if (child instanceof Parallel) {
      flat_child = flatten_parallel(child);
    } else if (child instanceof Sequential) {
      flat_child = flatten_sequential(child);
    }

    if (flat_child instanceof Parallel) {
      flattened.push(...flat_child.children);
    } else {
      flattened.push(flat_child);
    }
  }

  if (flattened.length === 0) {
    return Gap.ZERO;
  }

  if (flattened.length === 1) {
    return flattened[0];
  }

  return new Parallel(...flattened);
}

/**
 * Flatten a timeline, removing redundant uses of Sequential or Parallel
 * @template {TimeInterval} T
 * @param {Timeline<T>} timeline The original timeline
 * @returns {Timeline<T>} The flattened timeline
 */
export function flatten_timeline(timeline) {
  if (timeline instanceof Sequential) {
    return flatten_sequential(timeline);
  }

  if (timeline instanceof Parallel) {
    return flatten_parallel(timeline);
  }

  return timeline;
}
