import { ArcLength } from "../sketchlib/primitives/ArcLength.js";
import { PartialPrimitive } from "../sketchlib/primitives/Primitive.js";
import { group } from "../sketchlib/primitives/shorthand.js";

/**
 * Compute a cumulative sum on an array
 * @param {number[]} arr The input array [a, b, ..., n]
 * @returns {number[]} the cumulative sum [a, a + b, a + b + c, ..., total sum];
 */
function cum_sum(arr) {
  let total = 0;
  const result = [];
  for (const x of arr) {
    total += x;
    result.push(total);
  }
  return result;
}

/**
 * Find overlapping
 * @param {[number, number, number][]} overlaps array of (segment_index, start_s, end_s) (segment_index, relative_start_s, relative_end_s) relative to the length of the segment. This is for rendering a partial primitive in a later step.
 * @param {[number, number][]} segment_intervals sorted array of (segment_start, segment_end) arc lengths
 * @param {number} segment_index index of the current segment interval
 * @param {[number, number][]} intervals sorted array of query intervals
 * @param {number} interval_index index of the current query interval
 */
function find_overlaps(
  overlaps,
  segment_intervals,
  segment_index,
  intervals,
  interval_index,
) {
  // Stop when we exhaust one of the lists, as there will be
  // no further overlaps
  if (
    segment_index >= segment_intervals.length ||
    interval_index >= intervals.length
  ) {
    return;
  }

  const [segment_start, segment_end] = segment_intervals[segment_index];
  const [interval_start, interval_end] = intervals[interval_index];

  // the query interval is empty or backwards, ignore it and move on
  if (interval_end <= interval_start) {
    return find_overlaps(
      overlaps,
      segment_intervals,
      segment_index,
      intervals,
      interval_index + 1,
    );
  }

  // the query interval corresponds to a later segment,
  // so advance one segment and retry
  if (interval_start > segment_end) {
    return find_overlaps(
      overlaps,
      segment_intervals,
      segment_index + 1,
      intervals,
      interval_index,
    );
  }

  // the query interval doesn't overlap this segment,
  // so try the next query interval
  if (segment_start > interval_end) {
    return find_overlaps(
      overlaps,
      segment_intervals,
      segment_index,
      intervals,
      interval_index + 1,
    );
  }

  // all other cases overlap this segment, so
  // push an inteval
  const overlap_start = Math.max(segment_start, interval_start);
  const overlap_end = Math.min(segment_end, interval_end);
  overlaps.push([
    segment_index,
    overlap_start - segment_start,
    overlap_end - segment_start,
  ]);

  // we're done with this segment, so advance the segment.
  // but the query interval may overlap more segments, so keep going.
  return find_overlaps(
    overlaps,
    segment_intervals,
    segment_index + 1,
    intervals,
    interval_index,
  );
}

export class DashedPath {
  /**
   * Constructor
   * @param {(PartialPrimitive & ArcLength)[]} segments
   */
  constructor(segments) {
    this.segments = segments;
    this.arc_lengths = this.segments.map((x) => x.get_arc_length(1));
    this.cum_arc_lengths = cum_sum(this.arc_lengths);
    this.arc_length = this.cum_arc_lengths.at(-1);

    const intervals = new Array(segments.length);
    for (let i = 0; i < segments.length; i++) {
      const start = i === 0 ? 0 : this.cum_arc_lengths[i - 1];
      const end = start + this.arc_lengths[i];
      intervals[i] = [start, end];
    }
    this.segment_intervals = intervals;

    this.primitive = group();
  }

  /**
   * Update the primitive
   * @param {[number, number][]} arc_lengths pairs of arc lengths (start, end) with end >= start. The list should have no overlapping intervals, and the intervals must be sorted by start length
   */
  update_dashes(arc_lengths) {
    // If there are no segments or query intervals, there's nothing to render!
    if (this.segments.length === 0 || arc_lengths.length === 0) {
      this.primitive.regroup();
      return;
    }

    // merge the two sequences of intervals and find
    // where they overlap
    const overlaps = [];
    find_overlaps(overlaps, this.segment_intervals, 0, arc_lengths, 0);

    // Convert the arc lengths to time values
    // and then use PartialPrimitive.render_between()
    // to extract a primitive for each dash
    const dashes = overlaps.map(([index, s_start, s_end]) => {
      const segment = this.segments[index];
      const t_start = segment.get_t(s_start);
      const t_end = segment.get_t(s_end);
      return segment.render_between(t_start, t_end);
    });

    this.primitive.regroup(...dashes);
  }
}
