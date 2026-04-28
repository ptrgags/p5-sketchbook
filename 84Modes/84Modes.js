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
import { Point } from "../sketchlib/pga2d/Point.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";

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

/**
 * @implements {Animated}
 */
class Modes84Animation {
  constructor() {
    this.primitive = group(CIRCLE_OF_MODES);
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
  update(time) {}
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
