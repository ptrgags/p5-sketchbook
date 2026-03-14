import { ArcLength } from "../sketchlib/primitives/ArcLength.js";
import {
  PartialPrimitive,
  Primitive,
} from "../sketchlib/primitives/Primitive.js";

export class DashedTree {
  /**
   * Constructor
   * @param {PartialPrimitive & ArcLength} segment
   * @param {DashedTree[]} [children=[]]
   */
  constructor(segment, children = []) {
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
      const t_end = this.segment.get_t(overlap_end - this.end_length);
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
        "start_length undefined... did you forget to call measure_lengths()",
      );
    }

    if (arc_lengths.length === 0) {
      return [];
    }

    const overlaps = [];
    this.#compute_dashes_recursive(overlaps, arc_lengths, 0);

    return overlaps;
  }
}
