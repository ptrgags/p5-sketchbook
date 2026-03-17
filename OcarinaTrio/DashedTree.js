import { isArray, start } from "tone";
import { ArcLength } from "../sketchlib/primitives/ArcLength.js";
import {
  PartialPrimitive,
  Primitive,
} from "../sketchlib/primitives/Primitive.js";

/**
 * @typedef {PartialPrimitive & ArcLength} Segment
 * @typedef {(Segment | SegmentTree)[]} SegmentTree
 */

/**
 * A tree of path segments that can be drawn as dashed lines
 * with arc lengths measured from the root of the tree
 */
export class DashedTree {
  /**
   * Constructor
   * @param {Segment} segment The path for this node of the tree.
   * @param {...DashedTree} children
   */
  constructor(segment, ...children) {
    this.segment = segment;
    this.children = children;

    /**
     * @type {number}
     */
    this.start_length = undefined;
    /**
     * @type {number}
     */
    this.end_length = undefined;
  }

  /**
   * Iterate over all the segements. This is helpful for
   * rendering the outline of the pipe as a separate primitive.
   * @returns {Generator<Segment>}
   */
  *iter_segments() {
    yield this.segment;

    for (const child of this.children) {
      yield* child.iter_segments();
    }
  }

  /**
   * After the tree is constructed, call this method
   * on the root to compute the cumulative arc lengths
   * needed for
   * @param {number} parent_length
   */
  measure_lengths(parent_length = 0) {
    this.start_length = parent_length;
    this.end_length = parent_length + this.segment.arc_length;

    for (const child of this.children) {
      child.measure_lengths(this.end_length);
    }
  }

  /**
   * Recursively compute overlaps between the requested dashes. Each call
   * examines a single dash against the current segment
   * @param {Primitive[]} output The computed primitives
   * @param {[number, number][]} dashes (start_length, end_length) of requested dashes for the full tree
   * @param {number} dash_index Index of the current dash to examine
   */
  #compute_dashes_recursive(output, dashes, dash_index) {
    // Stop when we've exhausted the list of dashes
    if (dash_index >= dashes.length) {
      return;
    }

    const [dash_start, dash_end] = dashes[dash_index];

    // if the dash overlaps this segment, push a partial primitive.
    const overlap_start = Math.max(this.start_length, dash_start);
    const overlap_end = Math.min(this.end_length, dash_end);
    if (overlap_start < overlap_end) {
      const t_start = this.segment.get_t(overlap_start - this.start_length);
      const t_end = this.segment.get_t(overlap_end - this.start_length);
      const dash = this.segment.render_between(t_start, t_end);
      output.push(dash);
    }

    // advance through the tree and/or the list of dashes
    // depending on how much more length we have
    const advance_segments = this.end_length <= dash_end;
    const advance_dashes = dash_end <= this.end_length;

    if (advance_segments) {
      const next_dash_index = Number(advance_dashes);
      for (const child of this.children) {
        child.#compute_dashes_recursive(output, dashes, next_dash_index);
      }
    } else {
      this.#compute_dashes_recursive(output, dashes, dash_index + 1);
    }
  }

  /**
   * Compute the dashes
   * @param {[number, number][]} arc_lengths pairs of (start_length, end_length) where the dashes should appear
   * @returns {Primitive[]} The computed dashes mapped onto the tree of paths
   */
  compute_dashes(arc_lengths) {
    if (this.start_length === undefined) {
      throw new Error(
        "measure_lengths() must be called before compute_dashes()",
      );
    }

    if (arc_lengths.length === 0) {
      return [];
    }

    const overlaps = [];
    this.#compute_dashes_recursive(overlaps, arc_lengths, 0);

    return overlaps;
  }

  /**
   * Make a chain of segments above a tree
   * @param {Segment[]} segments
   * @param {DashedTree[]} children
   * @returns {DashedTree}
   */
  static #make_chain(segments, children) {
    const [first, ...rest] = segments;
    if (rest.length === 0) {
      return new DashedTree(first, ...children);
    }

    return new DashedTree(first, DashedTree.#make_chain(rest, children));
  }

  /**
   *
   * @param {SegmentTree} segments An array of the form [segments+, branch_arrays*]. segments are of type Segment, branch_arrays are arrays of the recursive type
   * @returns {DashedTree}
   */
  static from_segments(segments) {
    // the segments array is of the form
    // [chain_segments+, branch_arrays*]
    // where chain_segments is one or more Segment
    // and branch_arrays are one or more SegmentTree
    const branch_index = segments.findIndex(Array.isArray);

    /**
     * @type {Segment[]}
     */
    let chain;
    /**
     * @type {SegmentTree[]}
     */
    let branches;
    if (branch_index === -1) {
      chain = /**@type {Segment[]} */ (segments);
      branches = [];
    } else {
      // Up to the first array, segments are interpreted as a chain
      chain = /** @type {Segment[]} */ (segments.slice(0, branch_index));
      // Everything else is arrays
      branches = /**@type {SegmentTree[]} */ (segments.slice(branch_index));
    }

    if (chain.length === 0) {
      throw new Error("at least one segment must be provided");
    }

    if (!branches.every(Array.isArray)) {
      throw new Error("branches must all be arrays");
    }

    const children = branches.map(DashedTree.from_segments);
    return DashedTree.#make_chain(chain, children);
  }
}
