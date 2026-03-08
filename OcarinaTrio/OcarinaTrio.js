import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { PlayButtonScene } from "../sketchlib/scenes/PlayButtonScene.js";
import { SoundManager } from "../sketchlib/SoundManager.js";
import { SCORE_OCARINA_TRIO } from "../SoundTest/example_scores/ocarina_trio.js";
import { SoundScene } from "../sketchlib/scenes/SoundScene.js";
import { OcarinaAnimation } from "./OcarinaAnimation.js";
import { Scene } from "../sketchlib/scenes/Scene.js";
import { Animated } from "../sketchlib/animation/Animated.js";
import { configure_sketch } from "../sketchlib/configure_sketch.js";

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

export const sketch = (p) => {
  /** @type {PlayButtonScene | SoundScene} */
  let scene = new PlayButtonScene(SOUND);
  p.setup = () => {
    configure_sketch(p);

    MOUSE.setup(p.canvas);
    MOUSE.callbacks = scene.mouse_callbacks;

    scene.events.addEventListener("scene-change", async () => {
      await SOUND.init();
      scene = new SoundScene(SOUND, new OcarinaAnimation(SOUND));
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
