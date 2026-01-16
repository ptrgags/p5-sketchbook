import { Gap, Parallel, Sequential } from "./Timeline.js";

/**
 * Count the number of distinct parallel lines in the timeline.
 * @template {import("./Timeline.js").TimeInterval} T
 * @param {import("./Timeline.js").Timeline<T>} timeline The timeline to check
 * @returns {number} The number of voices in the timeline
 */
export function count_voices(timeline) {
  if (timeline instanceof Gap) {
    return 1;
  }

  if (timeline instanceof Sequential) {
    return timeline.children
      .map(count_voices)
      .reduce((acc, x) => Math.max(acc, x));
  }

  if (timeline instanceof Parallel) {
    return timeline.children.map(count_voices).reduce((acc, x) => acc + x);
  }

  // single T value
  return 1;
}
