import { Animated } from "../sketchlib/animation/Animated.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Color } from "../sketchlib/Color.js";
import { AbsInterval } from "../sketchlib/music/AbsTimeline.js";
import { Note } from "../sketchlib/music/Music.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { DashedPath } from "./DashedPath.js";

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
// Important, these segments have to be defined in the direction of the flow
// for the animation to look correct.
const PIPE_SEGMENTS_BASS = [
  new LinePrimitive(new Point(100, 0), new Point(100, 75)),
  new ArcPrimitive(new Point(125, 75), BEND_RADIUS, ANGLES_QUADRANT2.reverse()),
  new LinePrimitive(new Point(125, 100), new Point(150, 100)),
  new ArcPrimitive(new Point(150, 125), BEND_RADIUS, ANGLES_QUADRANT4),
  new LinePrimitive(new Point(175, 125), new Point(175, 150)),
  new ArcPrimitive(new Point(150, 150), BEND_RADIUS, ANGLES_QUADRANT1),
  new LinePrimitive(new Point(150, 175), new Point(125, 175)),
  new ArcPrimitive(
    new Point(125, 200),
    BEND_RADIUS,
    ANGLES_QUADRANT3.reverse(),
  ),
  new LinePrimitive(new Point(100, 200), new Point(100, 250)),
];

// since the end result will change anyway, keep the other pipes simple for now
const PIPE_SEGMENTS_TENOR = [
  new LinePrimitive(new Point(250, 0), new Point(250, 255)),
];
const PIPE_SEGMENTS_SOPRANO = [
  new LinePrimitive(new Point(400, 0), new Point(400, 255)),
];

const PIPE_WALLS = style(
  [...PIPE_SEGMENTS_BASS, ...PIPE_SEGMENTS_TENOR, ...PIPE_SEGMENTS_SOPRANO],
  STYLE_PIPE_WALLS,
);
const PIPE_INTERIOR = style(
  [...PIPE_SEGMENTS_BASS, ...PIPE_SEGMENTS_TENOR, ...PIPE_SEGMENTS_SOPRANO],
  STYLE_PIPE_INTERIOR,
);
const PIPES = group(PIPE_WALLS, PIPE_INTERIOR);

const STYLE_DASHES = new Style({
  stroke: Color.RED,
  width: 8,
});

/**
 * Take a sequence of intervals, and merge the time intervals that are
 * immediately adjacent
 * @param {AbsInterval<Note<number>>[]} intervals
 * @returns {AbsInterval<number>[]} merged intervals. The value is always 1, since only the times matter.
 */
function make_gate_signal(intervals) {
  const result = [];
  let start_time = intervals[0].start_time;
  let end_time = intervals[0].end_time;
  for (const interval of intervals) {
    if (interval.start_time.equals(end_time)) {
      // Merge two adjacent time intervals
      end_time = interval.end_time;
    } else {
      // There's a gap before the next interval, so flush the previous
      // one
      result.push(new AbsInterval(1, start_time, end_time));
      start_time = interval.start_time;
      end_time = interval.end_time;
    }
  }
  // flush the last interval
  result.push(new AbsInterval(1, start_time, end_time));
  return result;
}

/**
 * @implements {Animated}
 */
export class NotePipes {
  /**
   *
   * @param {AbsInterval<Note<number>>[][]} intervals
   * @param {number} velocity speed of the notes through the pipe in px/unit time
   */
  constructor(intervals, velocity) {
    this.bass_dashes = new DashedPath(PIPE_SEGMENTS_BASS);
    this.tenor_dashes = new DashedPath(PIPE_SEGMENTS_TENOR);
    this.soprano_dashes = new DashedPath(PIPE_SEGMENTS_SOPRANO);
    this.velocity = velocity;

    this.gate_signals = intervals.map(make_gate_signal);

    this.primitive = group(
      PIPES,
      style(this.bass_dashes.primitive, STYLE_DASHES),
      style(this.tenor_dashes.primitive, STYLE_DASHES),
      style(this.soprano_dashes.primitive, STYLE_DASHES),
    );
  }

  /**
   *
   * @param {DashedPath} dashes
   * @param {AbsInterval<number>[]} gate_signal
   * @param {number} time
   */
  update_dashes(dashes, gate_signal, time) {
    const total_bass_length = dashes.arc_length;
    /**
     * @type {[number, number][]}
     */
    const arc_lengths = gate_signal.map((interval) => {
      const start_s =
        total_bass_length + (interval.start_time.real - time) * this.velocity;
      const end_s =
        total_bass_length + (interval.end_time.real - time) * this.velocity;
      return [start_s, end_s];
    });

    dashes.update_dashes(arc_lengths);
  }

  update(time) {
    const [bass_gate, tenor_gate, soprano_gate] = this.gate_signals;
    this.update_dashes(this.bass_dashes, bass_gate, time);
    this.update_dashes(this.tenor_dashes, tenor_gate, time);
    this.update_dashes(this.soprano_dashes, soprano_gate, time);
  }
}
