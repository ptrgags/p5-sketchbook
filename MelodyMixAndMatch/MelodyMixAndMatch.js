import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { CanvasMouseHandler } from "../sketchlib/CanvasMouseHandler.js";
import { MouseInput } from "../sketchlib/MouseInput.js";
import { MuteButton } from "../sketchlib/MuteButton.js";
import { PlayButtonScene } from "../sketchlib/PlayButtonScene.js";
import { PatternLooper } from "./PatternLooper.js";
import { HARMONIC_MINOR_SCALE } from "../sketchlib/music/scales.js";
import { C4 } from "../sketchlib/music/pitches.js";
import { N16 } from "../sketchlib/music/durations.js";
import { PatternGrid } from "../sketchlib/music/PatternGrid.js";
import { TouchButton } from "../sketchlib/TouchButton.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Note } from "../sketchlib/music/Music.js";

const MOUSE = new CanvasMouseHandler();

//@ts-ignore
const LOOPER = new PatternLooper(Tone);

const SCALE = HARMONIC_MINOR_SCALE.to_scale(C4);

const PITCHES = [
  SCALE.sequence([0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5, 3, 4, 5, 6], N16),
  SCALE.sequence([0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7], N16),
  SCALE.sequence([0, 2, 4, 6, 1, 3, 5, 7, 8, 6, 4, 2, 7, 5, 3, 1], N16),
];

const RHYTHMS = [
  PatternGrid.rhythm("xxxxxxxxxxxxxxxx", N16),
  PatternGrid.rhythm("x--xx--xx--xx--x", N16),
  PatternGrid.rhythm("x.x.x.x.x.x.x.x.", N16),
  PatternGrid.rhythm("x-x-x-xxx-------", N16),
];

const BUTTON_DIMS = new Direction(WIDTH / 2, HEIGHT / 2);
const INCREMENT_PITCH = new TouchButton(
  new Rectangle(Point.ORIGIN, BUTTON_DIMS),
);
const DECREMENT_PITCH = new TouchButton(
  new Rectangle(new Point(0, HEIGHT / 2), BUTTON_DIMS),
);
const INCREMENT_RHYTHM = new TouchButton(
  new Rectangle(new Point(WIDTH / 2, 0), BUTTON_DIMS),
);
const DECREMENT_RHYTHM = new TouchButton(
  new Rectangle(new Point(WIDTH / 2, HEIGHT / 2), BUTTON_DIMS),
);

class SoundScene {
  /**
   *
   * @param {PatternLooper} looper
   */
  constructor(looper) {
    this.looper = looper;
    this.mute_button = new MuteButton();
    this.events = new EventTarget();

    this.mute_button.events.addEventListener(
      "change",
      (/**@type {CustomEvent}*/ e) => {
        this.looper.toggle_sound(e.detail.sound_on);
      },
    );

    this.pitch_index = 0;
    this.rhythm_index = 0;

    DECREMENT_PITCH.events.addEventListener("released", () => {
      this.pitch_index--;
      this.update_melody();
    });
    INCREMENT_PITCH.events.addEventListener("released", () => {
      this.pitch_index++;
      this.update_melody();
    });

    DECREMENT_RHYTHM.events.addEventListener("released", () => {
      this.rhythm_index--;
      this.update_melody();
    });
    INCREMENT_RHYTHM.events.addEventListener("released", () => {
      this.rhythm_index++;
      this.update_melody();
    });

    this.update_melody();
  }

  update_melody() {
    const rhythm = RHYTHMS[this.rhythm_index % RHYTHMS.length];
    const pitches = PITCHES[this.pitch_index % PITCHES.length];
    const notes = pitches.values.map((x) => new Note(x));
    const timeline = PatternGrid.zip_timeline(rhythm, notes);

    this.looper.set_pattern(timeline);

    //this.looper.set_pattern();
  }

  update() {
    // state changes each frame go here
    // note that you can do this.sound.get_param(param_id) if the score
    // has animations
  }

  render() {
    // Render stuff here
    return this.mute_button.render();
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_pressed(input) {
    this.mute_button.mouse_pressed(input);

    INCREMENT_PITCH.mouse_pressed(input.mouse_coords);
    DECREMENT_PITCH.mouse_pressed(input.mouse_coords);
    INCREMENT_RHYTHM.mouse_pressed(input.mouse_coords);
    DECREMENT_RHYTHM.mouse_pressed(input.mouse_coords);
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_moved(input) {
    this.mute_button.mouse_moved(input);

    INCREMENT_PITCH.mouse_moved(input.mouse_coords);
    DECREMENT_PITCH.mouse_moved(input.mouse_coords);
    INCREMENT_RHYTHM.mouse_moved(input.mouse_coords);
    DECREMENT_RHYTHM.mouse_moved(input.mouse_coords);
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_dragged(input) {
    this.mute_button.mouse_dragged(input);

    INCREMENT_PITCH.mouse_dragged(input.mouse_coords);
    DECREMENT_PITCH.mouse_dragged(input.mouse_coords);
    INCREMENT_RHYTHM.mouse_dragged(input.mouse_coords);
    DECREMENT_RHYTHM.mouse_dragged(input.mouse_coords);
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_released(input) {
    this.mute_button.mouse_released(input);

    INCREMENT_PITCH.mouse_released(input.mouse_coords);
    DECREMENT_PITCH.mouse_released(input.mouse_coords);
    INCREMENT_RHYTHM.mouse_released(input.mouse_coords);
    DECREMENT_RHYTHM.mouse_released(input.mouse_coords);
  }
}

/**
 *
 * @param {import("p5")} p
 */
export const sketch = (p) => {
  /** @type {PlayButtonScene | SoundScene} */
  let scene = new PlayButtonScene();
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      // @ts-ignore
      document.getElementById("sketch-canvas"),
    ).elt;

    MOUSE.setup(canvas);

    scene.events.addEventListener("scene-change", async () => {
      await LOOPER.init();
      scene = new SoundScene(LOOPER);
    });
  };

  p.draw = () => {
    p.background(0);

    scene.update();

    const scene_primitive = scene.render();
    scene_primitive.draw(p);
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
