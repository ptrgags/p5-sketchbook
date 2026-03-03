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

const BASS_CONFIG = {
  bounds: new Rectangle(new Point(0, 500), new Direction(200, 200)),
  // Orange
  color: new Oklch(0.6, 0.1, 60),
  octave: Ocarina.OCTAVE_BASS,
};
const TENOR_CONFIG = {
  bounds: new Rectangle(new Point(200, 550), new Direction(150, 150)),
  // Purple
  color: new Oklch(0.5, 0.1, 300),
  octave: Ocarina.OCTAVE_TENOR,
};
const SOPRANO_CONFIG = {
  bounds: new Rectangle(new Point(350, 700 - 112), new Direction(112, 112)),
  // Blue green
  color: new Oklch(0.6, 0.1, 213),
  octave: Ocarina.OCTAVE_SOPRANO,
};

const OCARINA_BOXES = group(
  style(
    new RectPrimitive(new Point(25, 0), new Direction(150, 150)),
    new Style({
      fill: BASS_CONFIG.color,
    }),
  ),
  style(
    new RectPrimitive(new Point(25 + 150, 0), new Direction(150, 150)),
    new Style({
      fill: TENOR_CONFIG.color,
    }),
  ),
  style(
    new RectPrimitive(new Point(25 + 2 * 150, 0), new Direction(150, 150)),
    new Style({
      fill: SOPRANO_CONFIG.color,
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

    const [soprano_notes, tenor_notes, bass_notes] = compute_played_notes();
    this.ocarinas = new AnimationGroup(
      new Ocarina(BASS_CONFIG, bass_notes),
      new Ocarina(TENOR_CONFIG, tenor_notes),
      new Ocarina(SOPRANO_CONFIG, soprano_notes),
    );

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

    // state changes each frame go here
    // note that you can do this.sound.get_param(param_id) if the score
    // has animations
  }

  render() {
    // Render stuff here
    const mute = this.mute_button.render();
    return group(OCARINA_BOXES, this.ocarinas.primitive, mute);
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
