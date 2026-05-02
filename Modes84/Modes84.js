import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { PlayButtonScene } from "../sketchlib/scenes/PlayButtonScene.js";
import { Animated } from "../sketchlib/animation/Animated.js";
import { SoundScene } from "../sketchlib/scenes/SoundScene.js";
import { MouseCallbacks } from "../sketchlib/input/MouseCallbacks.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { Color } from "../sketchlib/Color.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { VectorPrimitive } from "../sketchlib/primitives/VectorPrimitive.js";
import { Rational } from "../sketchlib/Rational.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { CLIP_84MODES, INSTRUMENT_84MODES } from "./mode_music.js";
import { SoundSystem } from "../sketchlib/tone_helpers/SoundSystem.js";

const MOUSE = new CanvasMouseHandler();

//@ts-ignore
const tone = Tone;
const SOUND = new SoundSystem(tone);

const STYLE_LINES = new Style({
  stroke: Color.WHITE,
  width: 4,
});

const NOTE_LABEL_RADIUS = 225;
const MODE_LABEL_RADIUS = 200;
const CIRCLE_RADIUS = 175;
const MAJOR_TICK_LENGTH = 32;
const MINOR_TICK_LENGTH = 16;
const POINTER_LENGTH = 160;

const MODE_CIRCLE = new Circle(SCREEN_CENTER, CIRCLE_RADIUS);

const MAJOR_TICKS = Direction.roots_of_unity(12).map((dir) => {
  return new LineSegment(
    SCREEN_CENTER.add(dir.scale(CIRCLE_RADIUS - MAJOR_TICK_LENGTH / 2)),
    SCREEN_CENTER.add(dir.scale(CIRCLE_RADIUS + MAJOR_TICK_LENGTH / 2)),
  );
});

const MINOR_TICKS = Direction.roots_of_unity(84).map((dir) => {
  return new LineSegment(
    SCREEN_CENTER.add(dir.scale(CIRCLE_RADIUS - MINOR_TICK_LENGTH / 2)),
    SCREEN_CENTER.add(dir.scale(CIRCLE_RADIUS + MINOR_TICK_LENGTH / 2)),
  );
});

const MEASURES_PER_MODE = 4;
const MODE_COUNT = 84;
const TOTAL_MEASURES = MODE_COUNT * MEASURES_PER_MODE;

const MODE_NAMES = [
  "Lydian",
  "Ionian (Major)",
  "Mixolydian",
  "Dorian",
  "Aeolian (Minor)",
  "Phrygian",
  "Locrian",
];
const MODE_NAMES_SHORT = ["Ly", "Io", "Mi", "Do", "Ae", "Ph", "Lo"];
const NOTE_NAMES = [
  "C",
  "B",
  "Bb",
  "A",
  "Ab",
  "G",
  "Gb",
  "F",
  "E",
  "Eb",
  "D",
  "Db",
];
const TEXT_STYLE_SCALE_LABEL = new TextStyle(32, "center", "top");
const TEXT_STYLE_NOTE_LABELS = new TextStyle(32, "center", "center");
const TEXT_STYLE_MODE_LABELS = new TextStyle(10, "center", "center");
const STYLE_TEXT_FILL = new Style({ fill: Color.WHITE });

const NOTE_LABELS = Direction.roots_of_unity(12).map((dir, i) => {
  return new TextPrimitive(
    NOTE_NAMES[i],
    SCREEN_CENTER.add(dir.scale(NOTE_LABEL_RADIUS)),
  );
});

const MODE_LABELS = Direction.roots_of_unity(MODE_COUNT).map((dir, i) => {
  const index = i % 7;
  return new TextPrimitive(
    MODE_NAMES_SHORT[index],
    SCREEN_CENTER.add(dir.scale(MODE_LABEL_RADIUS)),
  );
});

/**
 * @implements {Animated}
 */
class Modes84Animation {
  constructor() {
    this.bgm = SOUND.bgm;
    this.bgm.schedule_clip(CLIP_84MODES, INSTRUMENT_84MODES);

    INSTRUMENT_84MODES.volume = -6;

    const transport = SOUND.transport;
    transport.set_tempo(128);
    transport.set_loop(Rational.ZERO, new Rational(TOTAL_MEASURES));
    transport.start();

    this.pointer = new VectorPrimitive(
      SCREEN_CENTER,
      SCREEN_CENTER.add(Direction.DIR_X.scale(POINTER_LENGTH)),
    );
    this.label = new TextPrimitive("C Lydian", new Point(WIDTH / 2, 600));
    this.primitive = group(
      style(
        [MODE_CIRCLE, ...MAJOR_TICKS, ...MINOR_TICKS, this.pointer],
        STYLE_LINES,
      ),
      new GroupPrimitive(this.label, {
        style: STYLE_TEXT_FILL,
        text_style: TEXT_STYLE_SCALE_LABEL,
      }),
      new GroupPrimitive(NOTE_LABELS, {
        style: STYLE_TEXT_FILL,
        text_style: TEXT_STYLE_NOTE_LABELS,
      }),
      new GroupPrimitive(MODE_LABELS, {
        style: STYLE_TEXT_FILL,
        text_style: TEXT_STYLE_MODE_LABELS,
      }),
    );
  }

  /**
   * @type {MouseCallbacks[]}
   */
  get mouse_callbacks() {
    return [];
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    // The pointer rotates slowly clockwise in time with the music
    const angle = (2 * Math.PI * time) / TOTAL_MEASURES;
    this.pointer.tip = SCREEN_CENTER.add(
      Direction.from_angle(angle).scale(POINTER_LENGTH),
    );

    // Label the currently playing scale
    const scale_number = Math.floor(time / MEASURES_PER_MODE);
    const mode_number = scale_number % 7;
    const note_number = Math.floor(scale_number / 7);
    this.label.text = `${NOTE_NAMES[note_number]} ${MODE_NAMES[mode_number]}`;
  }
}

//@ts-ignore
export const sketch = (p) => {
  /** @type {PlayButtonScene | SoundScene} */
  let scene = new PlayButtonScene(SOUND);
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    ).elt;

    MOUSE.setup(canvas);
    MOUSE.callbacks = scene.mouse_callbacks;

    scene.events.addEventListener("scene-change", () => {
      scene = new SoundScene(SOUND, new Modes84Animation());
      MOUSE.callbacks = scene.mouse_callbacks;
    });
  };

  p.draw = () => {
    p.background(0);

    scene.update();
    scene.primitive.draw(p);
  };

  MOUSE.configure_callbacks(p);
};
