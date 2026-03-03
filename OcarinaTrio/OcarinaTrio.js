import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { CanvasMouseHandler } from "../sketchlib/CanvasMouseHandler.js";
import { MouseInput } from "../sketchlib/MouseInput.js";
import { MuteButton } from "../sketchlib/MuteButton.js";
import { PlayButtonScene } from "../sketchlib/PlayButtonScene.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { Ocarina } from "../sketchlib/music_vis/Ocarina.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { SCORE_OCARINA_TRIO } from "../SoundTest/example_scores/ocarina_trio.js";
import { AnimationGroup } from "../sketchlib/animation/AnimationGroup.js";
import { PlayedNotes } from "../SoundTest/PlayedNotes.js";
import { AbsTimelineOps } from "../sketchlib/music/AbsTimelineOps.js";
import { PianoRollBackground } from "./PianoRollBackground.js";
import { A3, F7 } from "../sketchlib/music/pitches.js";

const MOUSE = new CanvasMouseHandler();

// Add scores here
/**@type {import("../sketchlib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  scores: {
    ocarina_trio: SCORE_OCARINA_TRIO,
  },
};

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

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

const OCARINA_BOXES = group(
  style(
    new RectPrimitive(new Point(25, 0), new Direction(150, 150)),
    new Style({
      fill: BASS_CONFIG.color,
      stroke: BASS_CONFIG.color.adjust_lightness(-0.2),
      width: 4,
    }),
  ),
  style(
    new RectPrimitive(new Point(25 + 150, 0), new Direction(150, 150)),
    new Style({
      fill: TENOR_CONFIG.color,
      stroke: TENOR_CONFIG.color.adjust_lightness(-0.2),
      width: 4,
    }),
  ),
  style(
    new RectPrimitive(new Point(25 + 2 * 150, 0), new Direction(150, 150)),
    new Style({
      fill: SOPRANO_CONFIG.color,
      stroke: SOPRANO_CONFIG.color.adjust_lightness(-0.2),
      width: 4,
    }),
  ),
);

/**
 * Get the played notes from the score.
 * @returns {PlayedNotes[]}
 */
function compute_played_notes() {
  return SCORE_OCARINA_TRIO.parts.map((part) => {
    const abs_music = AbsTimelineOps.from_relative(part.music);
    const intervals = [...AbsTimelineOps.iter_intervals(abs_music)];
    return new PlayedNotes(intervals);
  });
}

class SoundScene {
  /**
   * Constructor
   * @param {SoundManager} sound Reference to the sound manager
   */
  constructor(sound) {
    this.sound = sound;
    this.mute_button = new MuteButton();
    this.events = new EventTarget();

    this.sound.play_score("ocarina_trio");
    this.sound.no_loop();

    const [soprano_notes, tenor_notes, bass_notes] = compute_played_notes();
    this.ocarinas = new AnimationGroup(
      new Ocarina(BASS_CONFIG, bass_notes),
      new Ocarina(TENOR_CONFIG, tenor_notes),
      new Ocarina(SOPRANO_CONFIG, soprano_notes),
    );

    const y = 150;
    const velocity = 100;
    this.background = new PianoRollBackground(y, velocity, [A3, F7]);

    // Schedule sound callbacks here
    // this.sound.events.addEventListener('event', (e) => ...);
    this.mute_button.events.addEventListener(
      "change",
      (/**@type {CustomEvent} */ e) => {
        this.sound.toggle_sound(e.detail.sound_on);
      },
    );
  }

  update() {
    const time = this.sound.transport_time;

    this.ocarinas.update(time);
    this.background.update(time);

    // state changes each frame go here
    // note that you can do this.sound.get_param(param_id) if the score
    // has animations
  }

  render() {
    // Render stuff here
    const mute = this.mute_button.render();
    return group(
      OCARINA_BOXES,
      this.background.primitive,
      this.ocarinas.primitive,
      mute,
    );
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_pressed(input) {
    this.mute_button.mouse_pressed(input);
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_moved(input) {
    this.mute_button.mouse_moved(input);
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_dragged(input) {
    this.mute_button.mouse_dragged(input);
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_released(input) {
    this.mute_button.mouse_released(input);
  }
}

/**
 *
 * @param {import("p5")} p
 */
export const sketch = (p) => {
  /** @type {PlayButtonScene | SoundScene} */
  let scene = new PlayButtonScene(SOUND);
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      // @ts-ignore
      document.getElementById("sketch-canvas"),
    ).elt;

    MOUSE.setup(canvas);

    scene.events.addEventListener("scene-change", () => {
      scene = new SoundScene(SOUND);
    });
  };

  p.draw = () => {
    p.background(0);

    scene.update();
    scene.render().draw(p);
  };

  MOUSE.mouse_pressed(p, (input) => {
    scene.mouse_pressed(input);
  });

  MOUSE.mouse_moved(p, (input) => {
    scene.mouse_moved(input);
  });

  MOUSE.mouse_released(p, (input) => {
    scene.mouse_released(input);
  });

  MOUSE.mouse_dragged(p, (input) => {
    scene.mouse_dragged(input);
  });
};
