import { Rational } from "../Rational";
import { Gap, Sequential, timeline_map } from "./Timeline";

/**
 * @typedef {Object} SimplifyOptions
 * @property {boolean} [flatten=true] Flatten redundant nesting
 */

// TODO: remove gaps in parallel?
// TODO: combine sequential gaps?

/**
 * @template {import("./Timeline").TimeInterval} T
 * @param {Sequential<T>} seq A sequence
 * @returns {import("./Timeline").Timeline<T>} a flattened timeline.
 */
function simplify_sequential(seq, options) {
  if (!options.flatten) {
    return seq;
  }

  // Empty sequence is equivalent to a zero-length gap
  if (seq.children.length === 0) {
    return new Gap(Rational.ZERO);
  }

  // Check for redundant sequential with only one child
  if (seq.children.length === 1) {
    return seq.children[0];
  }

  const flattened_children = [];

  for (const child of seq.children) {
    if (child instanceof Sequential) {
      // Nested sequentials are redundant, extract the children
      const flat_children = child.children.map((x) =>
        simplify_timeline(child, options)
      );
      flattened_children.push(...flat_children);
    } else {
      const flat_child = simplify_timeline(child, options);
      flattened_children.push(flat_child);
    }
  }
  return new Sequential(...flattened_children);
}

/**
 * @template {import("./Timeline").TimeInterval} T
 * @param {import("./Timeline").Timeline<T>} timeline The timeline to flatten
 * @param {SimplifyOptions} options Flags for enabling simplification rules
 * @returns {import("./Timeline").Timeline<T>} The simplified timeline
 */
export function simplify_timeline(timeline, options) {
  if (timeline instanceof Sequential) {
    return simplify_sequential(timeline, options);
  }

  return timeline;
}
