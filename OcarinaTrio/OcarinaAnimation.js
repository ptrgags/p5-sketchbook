import { Animated } from "../sketchlib/animation/Animated.js";
import { AnimationGroup } from "../sketchlib/animation/AnimationGroup.js";
import { AbsInterval } from "../sketchlib/music/AbsTimeline.js";
import { AbsTimelineOps } from "../sketchlib/music/AbsTimelineOps.js";
import { Note } from "../sketchlib/music/Music.js";
import { A3, F7 } from "../sketchlib/music/pitches.js";
import { Ocarina } from "../sketchlib/music_vis/Ocarina.js";
import { MuteButton } from "../sketchlib/MuteButton.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
import { Style } from "../sketchlib/Style.js";
import { SCORE_OCARINA_TRIO } from "../SoundTest/example_scores/ocarina_trio.js";
import { PlayedNotes } from "../SoundTest/PlayedNotes.js";
import { PianoRoll } from "./PianoRoll.js";
import { PianoRollBackground } from "./PianoRollBackground.js";

const START_X = 25;
const BOX_DIMENSIONS = new Direction(150, 150);
const BOUNDING_BOXES = [
  new Rectangle(new Point(START_X, 0), BOX_DIMENSIONS),
  new Rectangle(new Point(START_X + BOX_DIMENSIONS.x, 0), BOX_DIMENSIONS),
  new Rectangle(new Point(START_X + 2 * BOX_DIMENSIONS.x, 0), BOX_DIMENSIONS),
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
      new Point(25, 0).add(BOX_MARGIN),
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
      new Point(25 + 150, 0).add(BOX_MARGIN),
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
      new Point(25 + 2 * 150, 0).add(BOX_MARGIN),
      new Direction(150, 150).add(BOX_MARGIN.scale(-2)),
    ),
    new Style({
      fill: SOPRANO_CONFIG.color,
      stroke: SOPRANO_CONFIG.color.adjust_lightness(-0.2),
      width: 4,
    }),
  ),
);

/**
 * Get the played notes from the score.
 * @returns {AbsInterval<Note<number>>[][]}
 */
function compute_played_notes() {
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
    this.mute_button = new MuteButton(sound);
    this.events = new EventTarget();

    this.sound.play_score("ocarina_trio");
    this.sound.no_loop();

    const [soprano_notes, tenor_notes, bass_notes] = compute_played_notes();
    this.ocarinas = new AnimationGroup(
      new Ocarina(BASS_CONFIG, new PlayedNotes(bass_notes)),
      new Ocarina(TENOR_CONFIG, new PlayedNotes(tenor_notes)),
      new Ocarina(SOPRANO_CONFIG, new PlayedNotes(soprano_notes)),
    );

    const y = 150;
    const velocity = 200;
    /**
     * @type {[number, number]}
     */
    const pitch_range = [A3, F7];
    this.background = new PianoRollBackground(y, velocity, pitch_range);
    this.piano_rolls = new AnimationGroup(
      new PianoRoll(
        bass_notes,
        y,
        velocity,
        pitch_range,
        new Style({ fill: BASS_CONFIG.color }),
      ),
      new PianoRoll(
        tenor_notes,
        y,
        velocity,
        pitch_range,
        new Style({ fill: TENOR_CONFIG.color }),
      ),
      new PianoRoll(
        soprano_notes,
        y,
        velocity,
        pitch_range,
        new Style({ fill: SOPRANO_CONFIG.color }),
      ),
    );

    this.primitive = group(
      this.background.primitive,
      this.piano_rolls.primitive,
      OCARINA_BOXES,
      this.ocarinas.primitive,
    );
  }

  update() {
    const time = this.sound.transport_time;

    this.ocarinas.update(time);
    this.piano_rolls.update(time);
    this.background.update(time);
  }

  render() {}
}
