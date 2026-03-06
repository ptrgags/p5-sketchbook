import { Animated } from "../sketchlib/animation/Animated.js";
import { AnimationGroup } from "../sketchlib/animation/AnimationGroup.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH } from "../sketchlib/dimensions.js";
import { AbsInterval } from "../sketchlib/music/AbsTimeline.js";
import { AbsTimelineOps } from "../sketchlib/music/AbsTimelineOps.js";
import { Note } from "../sketchlib/music/Music.js";
import { A3, F7 } from "../sketchlib/music/pitches.js";
import { Ocarina } from "../sketchlib/music_vis/Ocarina.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style, xform } from "../sketchlib/primitives/shorthand.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
import { Style } from "../sketchlib/Style.js";
import { SCORE_OCARINA_TRIO } from "../SoundTest/example_scores/ocarina_trio.js";
import { PlayedNotes } from "../SoundTest/PlayedNotes.js";
import { PianoRoll } from "./PianoRoll.js";
import { PianoRollBackground } from "./PianoRollBackground.js";

const BOX_ORIGIN = new Point(25, 275);
const BOX_DIMENSIONS = new Direction(150, 150);
const BOX_STRIDE = Direction.DIR_X.scale(BOX_DIMENSIONS.x);
const BOUNDING_BOXES = [
  new Rectangle(BOX_ORIGIN, BOX_DIMENSIONS),
  new Rectangle(BOX_ORIGIN.add(BOX_STRIDE), BOX_DIMENSIONS),
  new Rectangle(BOX_ORIGIN.add(BOX_STRIDE.scale(2)), BOX_DIMENSIONS),
];

/**
 * Scale a bounding box about its center, creating a smaller box
 * @param {Rectangle} bounding_box
 * @param {number} factor scale factor
 * @returns {Rectangle}
 */
function smaller_box(bounding_box, factor) {
  return Rectangle.from_center(
    bounding_box.center,
    bounding_box.dimensions.scale(factor),
  );
}

const BASS_CONFIG = {
  bounds: smaller_box(BOUNDING_BOXES[0], 0.9),
  // Orange
  color: new Oklch(0.6, 0.1, 60),
  octave: Ocarina.OCTAVE_BASS,
};
const TENOR_CONFIG = {
  bounds: smaller_box(BOUNDING_BOXES[1], 0.8),
  // Purple
  color: new Oklch(0.5, 0.1, 300),
  octave: Ocarina.OCTAVE_TENOR,
};
const SOPRANO_CONFIG = {
  bounds: smaller_box(BOUNDING_BOXES[2], 0.7),
  // Blue green
  color: new Oklch(0.6, 0.1, 213),
  octave: Ocarina.OCTAVE_SOPRANO,
};

const BOX_MARGIN = new Direction(6, 6);

const OCARINA_BOXES = group(
  style(
    new RectPrimitive(
      BOX_ORIGIN.add(BOX_MARGIN),
      new Direction(150, 150).add(BOX_MARGIN.scale(-2)),
    ),
    new Style({
      fill: BASS_CONFIG.color,
      stroke: BASS_CONFIG.color.adjust_lightness(-0.2),
      width: 4,
    }),
  ),
  style(
    new RectPrimitive(
      BOX_ORIGIN.add(BOX_STRIDE).add(BOX_MARGIN),
      new Direction(150, 150).add(BOX_MARGIN.scale(-2)),
    ),
    new Style({
      fill: TENOR_CONFIG.color,
      stroke: TENOR_CONFIG.color.adjust_lightness(-0.2),
      width: 4,
    }),
  ),
  style(
    new RectPrimitive(
      BOX_ORIGIN.add(BOX_STRIDE.scale(2)).add(BOX_MARGIN),
      new Direction(150, 150).add(BOX_MARGIN.scale(-2)),
    ),
    new Style({
      fill: SOPRANO_CONFIG.color,
      stroke: SOPRANO_CONFIG.color.adjust_lightness(-0.2),
      width: 4,
    }),
  ),
);

const STYLE_NOZZLES = new Style({
  fill: Color.from_hex_code("#666666"),
  stroke: Color.from_hex_code("#222222"),
  width: 4,
});
const INPUT_NOZZLE_SHAPE = new PolygonPrimitive(
  [
    new Point(25, 425),
    new Point(0, 450),
    new Point(WIDTH, 450),
    new Point(475, 425),
  ],
  true,
);
const INPUT_NOZZLE = style(INPUT_NOZZLE_SHAPE, STYLE_NOZZLES);
const OUTPUT_NOZZLE = new PolygonPrimitive(
  [
    new Point(0, 25),
    new Point(50, 25),
    new Point(25 + 12, 0),
    new Point(25 - 12, 0),
  ],
  true,
);
// one nozzle per instrument
const OUTPUT_NOZZLES = style(
  [
    xform(OUTPUT_NOZZLE, new Transform(new Direction(75, 250))),
    xform(OUTPUT_NOZZLE, new Transform(new Direction(225, 250))),
    xform(OUTPUT_NOZZLE, new Transform(new Direction(375, 250))),
  ],
  STYLE_NOZZLES,
);

const STYLE_PIPE_WALLS = new Style({
  stroke: Color.from_hex_code("#666666"),
  width: 12,
});
const STYLE_PIPE_INTERIOR = new Style({
  stroke: Color.from_hex_code("#111111"),
  width: 8,
});

// TODO: These might be backwards...
const ANGLES_QUADRANT4 = new ArcAngles(0, Math.PI / 2);
const ANGLES_QUADRANT3 = new ArcAngles(Math.PI / 2, Math.PI);
const ANGLES_QUADRANT2 = new ArcAngles(Math.PI, (3 * Math.PI) / 2);
const ANGLES_QUADRANT1 = new ArcAngles((3 * Math.PI) / 2, 2 * Math.PI);
const BEND_RADIUS = 25;
const PIPE_SEGMENTS_BASS = [
  new LinePrimitive(new Point(100, 0), new Point(100, 75)),
  new ArcPrimitive(new Point(125, 75), BEND_RADIUS, ANGLES_QUADRANT3),
  new LinePrimitive(new Point(125, 100), new Point(150, 100)),
  new ArcPrimitive(new Point(150, 125), BEND_RADIUS, ANGLES_QUADRANT1),
  new LinePrimitive(new Point(175, 125), new Point(175, 150)),
  new ArcPrimitive(new Point(150, 150), BEND_RADIUS, ANGLES_QUADRANT4),
  new LinePrimitive(new Point(125, 175), new Point(150, 175)),
  new ArcPrimitive(new Point(125, 200), BEND_RADIUS, ANGLES_QUADRANT2),
  new LinePrimitive(new Point(100, 200), new Point(100, 250)),
];

const PIPE_WALLS = style(PIPE_SEGMENTS_BASS, STYLE_PIPE_WALLS);
const PIPE_INTERIOR = style(PIPE_SEGMENTS_BASS, STYLE_PIPE_INTERIOR);
const PIPES = group(PIPE_WALLS, PIPE_INTERIOR);

/**
 * Get the played notes from the score.
 * @returns {AbsInterval<Note<number>>[][]}
 */
function get_intervals() {
  return SCORE_OCARINA_TRIO.parts.map((part) => {
    const abs_music = AbsTimelineOps.from_relative(part.music);
    const intervals = [...AbsTimelineOps.iter_intervals(abs_music)];
    return intervals;
  });
}

/**
 * Take a sequence of intervals, and merge the time intervals that are
 * immediately adjacent
 * @param {AbsInterval<Note<Number>>[]} intervals
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

const GATE_VELOCITY = 100;
/**
 * Take the result from make_gate_signal and make rectangles to visualize it.
 * This is temporary, I have some ideas for a more elaborate visualization, but
 * one step at a time.
 * @param {AbsInterval<number>[]} intervals
 * @param {number} y
 * @returns {GroupPrimitive}
 */
function render_gate(intervals, y) {
  const HEIGHT = 10;
  const rects = [];
  for (const interval of intervals) {
    const x = interval.start_time.real * GATE_VELOCITY;
    const width = interval.duration.real * GATE_VELOCITY;
    rects.push(
      new RectPrimitive(new Point(x, y), new Direction(width, HEIGHT)),
    );
  }
  return group(...rects);
}

/**
 * @implements {Animated}
 */
export class OcarinaAnimation {
  /**
   * Constructor
   * @param {SoundManager} sound Reference to the sound manager
   */
  constructor(sound) {
    this.sound = sound;
    this.events = new EventTarget();

    this.sound.play_score("ocarina_trio");
    this.sound.no_loop();

    const [soprano_intervals, tenor_intervals, bass_intervals] =
      get_intervals();
    this.ocarinas = new AnimationGroup(
      new Ocarina(BASS_CONFIG, new PlayedNotes(bass_intervals)),
      new Ocarina(TENOR_CONFIG, new PlayedNotes(tenor_intervals)),
      new Ocarina(SOPRANO_CONFIG, new PlayedNotes(soprano_intervals)),
    );

    const bass_gate = render_gate(make_gate_signal(bass_intervals), 0);
    const tenor_gate = render_gate(make_gate_signal(tenor_intervals), 10);
    const soprano_gate = render_gate(make_gate_signal(soprano_intervals), 20);
    this.gates = new GroupPrimitive([bass_gate, tenor_gate, soprano_gate], {
      transform: new Transform(Direction.ZERO),
      style: new Style({
        fill: Color.RED,
      }),
    });

    const y = 450;
    const velocity = 200;
    /**
     * @type {[number, number]}
     */
    const pitch_range = [A3, F7];
    this.background = new PianoRollBackground(y, velocity, pitch_range);
    this.piano_rolls = new AnimationGroup(
      new PianoRoll(
        bass_intervals,
        y,
        velocity,
        pitch_range,
        new Style({ fill: BASS_CONFIG.color }),
      ),
      new PianoRoll(
        tenor_intervals,
        y,
        velocity,
        pitch_range,
        new Style({ fill: TENOR_CONFIG.color }),
      ),
      new PianoRoll(
        soprano_intervals,
        y,
        velocity,
        pitch_range,
        new Style({ fill: SOPRANO_CONFIG.color }),
      ),
    );

    this.primitive = group(
      this.background.primitive,
      this.piano_rolls.primitive,
      PIPES,
      INPUT_NOZZLE,
      OUTPUT_NOZZLES,
      OCARINA_BOXES,
      this.ocarinas.primitive,
      //this.gates,
    );
  }

  update() {
    const time = this.sound.transport_time;

    this.ocarinas.update(time);
    this.piano_rolls.update(time);
    this.background.update(time);

    const x = time * GATE_VELOCITY;
    this.gates.transform.translation = new Direction(-x, 150);
  }

  render() {}
}
