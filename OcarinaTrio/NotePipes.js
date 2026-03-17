import { Animated } from "../sketchlib/animation/Animated.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Color } from "../sketchlib/Color.js";
import { AbsInterval } from "../sketchlib/music/AbsTimeline.js";
import { Note } from "../sketchlib/music/Music.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { DashedTree } from "./DashedTree.js";
import {
  PIPE_TREE_BASS,
  PIPE_TREE_SOPRANO,
  PIPE_TREE_TENOR,
} from "./pipe_network.js";

const STYLE_PIPE_WALLS = new Style({
  stroke: Color.from_hex_code("#666666"),
  width: 12,
});
const STYLE_PIPE_INTERIOR = new Style({
  stroke: Color.from_hex_code("#111111"),
  width: 8,
});

// Remember, angles are measured _clockwise_
const ANGLES_QUADRANT1 = new ArcAngles(0, Math.PI / 2);
const ANGLES_QUADRANT2 = new ArcAngles(Math.PI / 2, Math.PI);
const ANGLES_QUADRANT3 = new ArcAngles(Math.PI, (3 * Math.PI) / 2);
const ANGLES_QUADRANT4 = new ArcAngles((3 * Math.PI) / 2, 2 * Math.PI);
const BEND_RADIUS = 25;

/*
const PIPE_TREE_BASS = DashedTree.from_segments([
  new LineSegment(new Point(100, 250), new Point(100, 200)),
  [
    new ArcPrimitive(new Point(125, 200), BEND_RADIUS, ANGLES_QUADRANT3),
    new LineSegment(new Point(125, 175), new Point(150, 175)),
    new ArcPrimitive(
      new Point(150, 150),
      BEND_RADIUS,
      ANGLES_QUADRANT1.reverse(),
    ),
    new LineSegment(new Point(175, 150), new Point(175, 125)),
    new ArcPrimitive(
      new Point(150, 125),
      BEND_RADIUS,
      ANGLES_QUADRANT4.reverse(),
    ),
    new LineSegment(new Point(150, 100), new Point(125, 100)),
    new ArcPrimitive(new Point(125, 75), BEND_RADIUS, ANGLES_QUADRANT2),
    new LineSegment(new Point(100, 75), new Point(100, 0)),
  ],
  [
    new ArcPrimitive(
      new Point(75, 200),
      BEND_RADIUS,
      ANGLES_QUADRANT4.reverse(),
    ),
    new ArcPrimitive(new Point(75, 150), BEND_RADIUS, ANGLES_QUADRANT2),
    new LineSegment(new Point(50, 150), new Point(50, 0)),
  ],
]);

const PIPE_TREE_TENOR = DashedTree.from_segments([
  new LineSegment(new Point(250, 255), new Point(250, 100)),
  [
    new ArcPrimitive(new Point(275, 100), BEND_RADIUS, ANGLES_QUADRANT3),
    new ArcPrimitive(
      new Point(275, 50),
      BEND_RADIUS,
      ANGLES_QUADRANT1.reverse(),
    ),
    new LineSegment(new Point(300, 50), new Point(300, 0)),
  ],
  [new LineSegment(new Point(250, 100), new Point(250, 0))],
]);

const PIPE_TREE_SOPRANO = DashedTree.from_segments([
  new LineSegment(new Point(400, 250), new Point(400, 175)),
  [
    new LineSegment(new Point(400, 175), new Point(400, 125)),
    new ArcPrimitive(new Point(425, 125), BEND_RADIUS, ANGLES_QUADRANT3),
    new LineSegment(new Point(425, 100), new Point(500, 100)),
  ],
  [
    new ArcPrimitive(
      new Point(375, 175),
      BEND_RADIUS,
      ANGLES_QUADRANT4.reverse(),
    ),
    new ArcPrimitive(new Point(375, 125), BEND_RADIUS, ANGLES_QUADRANT2),
    new LineSegment(new Point(350, 125), new Point(350, 0)),
  ],
]);

PIPE_TREE_BASS.measure_lengths();
PIPE_TREE_TENOR.measure_lengths();
PIPE_TREE_SOPRANO.measure_lengths();
*/

const ALL_PIPES = [
  ...PIPE_TREE_BASS.iter_segments(),
  ...PIPE_TREE_TENOR.iter_segments(),
  ...PIPE_TREE_SOPRANO.iter_segments(),
];

const PIPE_WALLS = style(ALL_PIPES, STYLE_PIPE_WALLS);
const PIPE_INTERIOR = style(ALL_PIPES, STYLE_PIPE_INTERIOR);
const PIPES = group(PIPE_WALLS, PIPE_INTERIOR);

/**
 *
 * @param {Oklch} color
 * @returns {Style}
 */
function fluid_style(color) {
  return new Style({ stroke: color, width: 8 });
}

/**
 *
 * @param {AbsInterval<number>[]} intervals
 * @returns {Generator<AbsInterval<number>>}
 */
function* merge_gate(intervals) {
  if (intervals.length === 0) {
    return;
  }

  if (intervals.length === 1) {
    yield intervals[0];
    return;
  }

  let current = intervals[0];
  for (let i = 1; i < intervals.length - 1; i++) {
    const interval = intervals[i];

    // If the intervals meet at the end points, merge the intervals
    if (interval.start_time.equals(current.end_time)) {
      current = new AbsInterval(1, current.start_time, interval.end_time);
      continue;
    }

    yield current;
    current = interval;
  }

  // for the last interval we need to flush everything
  const interval = intervals.at(-1);
  if (interval.start_time.equals(current.end_time)) {
    current = new AbsInterval(1, current.start_time, interval.end_time);
    yield current;
  } else {
    yield current;
    yield interval;
  }
}

/**
 * Take a sequence of intervals, and merge the time intervals that are
 * immediately adjacent
 *
 * Exposed for unit testing to investigate a bug
 * @private
 * @param {AbsInterval<Note<number>>[]} intervals intervals in sorted order by start time
 * @returns {AbsInterval<number>[]} merged intervals. The value is always 1, since only the times matter.
 */
export function make_gate_signal(intervals) {
  const unmerged = intervals.map(
    (x) => new AbsInterval(1, x.start_time, x.end_time),
  );

  for (let i = 1; i < unmerged.length; i++) {
    if (unmerged[i - 1].end_time.gt(unmerged[i].start_time)) {
      throw new Error("intervals must not overlap in time");
    }
  }

  return merge_gate(unmerged).toArray();
}

/**
 * @implements {Animated}
 */
export class NotePipes {
  /**
   * Constructor
   * @param {AbsInterval<Note<number>>[][]} intervals
   * @param {Oklch[]} colors
   * @param {number} velocity speed of the notes through the pipe in px/unit time
   */
  constructor(intervals, colors, velocity) {
    this.velocity = velocity;

    this.gate_signals = intervals.map(make_gate_signal);

    const [bass_color, tenor_color, soprano_color] = colors;

    this.bass_dashes = style([], fluid_style(bass_color));
    this.tenor_dashes = style([], fluid_style(tenor_color));
    this.soprano_dashes = style([], fluid_style(soprano_color));

    this.primitive = group(
      PIPES,
      this.bass_dashes,
      this.tenor_dashes,
      this.soprano_dashes,
    );
  }

  /**
   *
   * @param {GroupPrimitive} output
   * @param {DashedTree} dashes
   * @param {AbsInterval<number>[]} gate_signal
   * @param {number} time
   */
  update_dashes(output, dashes, gate_signal, time) {
    /**
     * @type {[number, number][]}
     */
    const arc_lengths = gate_signal.map((interval) => {
      // the notes flow upwards through the pipes which is the opposite
      // direction that the notes are listed in the score, hence swapping
      // start/end time
      const start_s = (time - interval.end_time.real) * this.velocity;
      const end_s = (time - interval.start_time.real) * this.velocity;
      return [start_s, end_s];
    });
    arc_lengths.reverse();

    output.regroup(...dashes.compute_dashes(arc_lengths));
  }

  update(time) {
    const [bass_gate, tenor_gate, soprano_gate] = this.gate_signals;
    this.update_dashes(this.bass_dashes, PIPE_TREE_BASS, bass_gate, time);
    this.update_dashes(this.tenor_dashes, PIPE_TREE_TENOR, tenor_gate, time);
    this.update_dashes(
      this.soprano_dashes,
      PIPE_TREE_SOPRANO,
      soprano_gate,
      time,
    );
  }
}
