import { Sequential } from "./Timeline";

/**
 * @typedef {Object} SimplifyOptions
 * @property {boolean} [flatten=true] Flatten redundant nesting
 */

// TODO: remove gaps in parallel?
// TODO: combine sequential gaps?

/**
 * @template {import("./Timeline").TimeInterval} T
 * @param {import("./Timeline").Timeline<T>} timeline The timeline to flatten
 * @param {SimplifyOptions} options Flags for enabling simplification rules
 * @returns {import("./Timeline").Timeline<T>} The simplified timeline
 */
export function simplify_timeline(timeline, options) {
  if (timeline instanceof Sequential) {
    // Sequential(single_child) -> single_child
    if (options.flatten && timeline.children.length === 1) {
      return timeline.children[0];
    }
  }

  return timeline;
}
