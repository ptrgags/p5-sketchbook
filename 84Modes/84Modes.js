import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { PlayButtonScene } from "../sketchlib/scenes/PlayButtonScene.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
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
import { Transport } from "../sketchlib/tone_helpers/Transport.js";
import { Rational } from "../sketchlib/Rational.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";

const MOUSE = new CanvasMouseHandler();

// Add scores here
/**@type {import("../sketchlib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  scores: {},
};

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

const STYLE_LINES = new Style({
  stroke: Color.WHITE,
  width: 4,
});

const CIRCLE_RADIUS = 240;
const MODE_CIRCLE = new Circle(SCREEN_CENTER, CIRCLE_RADIUS);

const MAJOR_TICK_LENGTH = 32;
const MAJOR_TICKS = Direction.roots_of_unity(12).map((dir) => {
  return new LineSegment(
    SCREEN_CENTER.add(dir.scale(CIRCLE_RADIUS - MAJOR_TICK_LENGTH / 2)),
    SCREEN_CENTER.add(dir.scale(CIRCLE_RADIUS + MAJOR_TICK_LENGTH / 2)),
  );
});

const MINOR_TICK_LENGTH = 16;
const MINOR_TICKS = Direction.roots_of_unity(84).map((dir) => {
  return new LineSegment(
    SCREEN_CENTER.add(dir.scale(CIRCLE_RADIUS - MINOR_TICK_LENGTH / 2)),
    SCREEN_CENTER.add(dir.scale(CIRCLE_RADIUS + MINOR_TICK_LENGTH / 2)),
  );
});

const CIRCLE_OF_MODES = style(
  [MODE_CIRCLE, ...MINOR_TICKS, ...MAJOR_TICKS],
  STYLE_LINES,
);

const POINTER_LENGTH = 200;

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

/**
 * @implements {Animated}
 */
class Modes84Animation {
  /**
   *
   * @param {Transport} transport
   */
  constructor(transport) {
    this.transport = transport;
    transport.set_loop(Rational.ZERO, new Rational(TOTAL_MEASURES));
    transport.start();

    this.pointer = new VectorPrimitive(
      SCREEN_CENTER,
      SCREEN_CENTER.add(Direction.DIR_X.scale(POINTER_LENGTH)),
    );
    this.label = new TextPrimitive(
      "C Lydian",
      SCREEN_CENTER.add(Direction.DIR_Y.scale(50)),
    );
    this.primitive = group(
      CIRCLE_OF_MODES,
      style(this.pointer, STYLE_LINES),
      new GroupPrimitive(this.label, {
        style: new Style({ fill: Color.WHITE }),
        text_style: new TextStyle(32, "center", "top"),
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
      scene = new SoundScene(SOUND, new Modes84Animation(SOUND.transport));
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
