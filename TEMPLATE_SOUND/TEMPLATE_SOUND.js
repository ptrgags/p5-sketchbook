import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { PlayButtonScene } from "../sketchlib/scenes/PlayButtonScene.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
import { Animated } from "../sketchlib/animation/Animated.js";
import { SoundScene } from "../sketchlib/scenes/SoundScene.js";
import { MouseCallbacks } from "../sketchlib/input/MouseCallbacks.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { configure_sketch } from "../sketchlib/configure_sketch.js";

const MOUSE = new CanvasMouseHandler();

// Add scores here
/**@type {import("../sketchlib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {};

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

/**
 * @implements {Animated}
 */
class TEMPLATEAnimation {
  constructor() {
    this.primitive = group();
  }

  /**
   * @type {MouseCallbacks[]}
   */
  get mouse_callbacks() {
    return [];
  }

  update() {}
}

export const sketch = (p) => {
  /** @type {PlayButtonScene | SoundScene} */
  let scene = new PlayButtonScene(SOUND);
  p.setup = () => {
    configure_sketch(p);

    MOUSE.setup(p.canvas);
    MOUSE.callbacks = scene.mouse_callbacks;

    scene.events.addEventListener("scene-change", () => {
      scene = new SoundScene(SOUND, new TEMPLATEAnimation());
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
