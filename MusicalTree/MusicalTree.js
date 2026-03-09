import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { PlayButtonScene } from "../sketchlib/scenes/PlayButtonScene.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
import { AnimatedTurtleTree } from "./AnimatedTurtleTree.js";
import { Animated } from "../sketchlib/animation/Animated.js";
import { SoundScene } from "../sketchlib/scenes/SoundScene.js";
import { configure_sketch } from "../sketchlib/configure_sketch.js";

const ANIMATION = new AnimatedTurtleTree(7);

const MOUSE = new CanvasMouseHandler();

// Add scores here
/**@type {import("../sketchlib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  scores: {
    tree: ANIMATION.score,
  },
};

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

/**
 * @implements {Animated}
 */
class MusicalTreeAnimation {
  /**
   * Constructor
   * @param {SoundManager} sound Reference to the sound manager
   */
  constructor(sound) {
    sound.play_score("tree");
    sound.no_loop();

    this.primitive = group(ANIMATION.render(0));
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    this.primitive.regroup(ANIMATION.render(time));
  }
}

export const sketch = (p) => {
  /** @type {PlayButtonScene | SoundScene} */
  let scene = new PlayButtonScene(SOUND);
  p.setup = () => {
    configure_sketch(p);
    MOUSE.setup(p.canvas);
    MOUSE.callbacks = scene.mouse_callbacks;

    scene.events.addEventListener("scene-change", () => {
      scene = new SoundScene(SOUND, new MusicalTreeAnimation(SOUND));
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
