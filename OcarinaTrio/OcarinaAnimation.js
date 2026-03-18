import { Animated } from "../sketchlib/animation/Animated.js";
import { AnimationGroup } from "../sketchlib/animation/AnimationGroup.js";
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
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style, xform } from "../sketchlib/primitives/shorthand.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
import { Style } from "../sketchlib/Style.js";
import { SCORE_OCARINA_TRIO } from "../SoundTest/example_scores/ocarina_trio.js";
import { PlayedNotes } from "../SoundTest/PlayedNotes.js";
import { NotePipes } from "./NotePipes.js";
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

    const pipe_velocity = 300;
    this.pipes = new NotePipes(
      [bass_intervals, tenor_intervals, soprano_intervals],
      [BASS_CONFIG.color, TENOR_CONFIG.color, SOPRANO_CONFIG.color],
      pipe_velocity,
    );

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

    this.dashed_bezier = style(
      [],
      new Style({
        stroke: Color.RED,
        width: 8,
      }),
    );

    this.primitive = group(
      this.background.primitive,
      this.piano_rolls.primitive,
      this.pipes.primitive,
      INPUT_NOZZLE,
      OUTPUT_NOZZLES,
      OCARINA_BOXES,
      this.ocarinas.primitive,
    );
  }

  update() {
    const time = this.sound.transport_time;

    this.ocarinas.update(time);
    this.piano_rolls.update(time);
    this.background.update(time);
    this.pipes.update(time);
  }

  render() {}
}
