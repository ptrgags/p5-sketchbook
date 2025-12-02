import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/p5_helpers/draw_primitive.js";
import { group } from "../../sketchlib/rendering/shorthand.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { MouseInput } from "../lablib/MouseInput.js";
import { MuteButton } from "../lablib/MuteButton.js";
import { PlayButtonScene } from "../lablib/PlayButtonScene.js";
import { SoundManager } from "../lablib/SoundManager.js";
import { AnimatedTurtleTree } from "./AnimatedTurtleTree.js";

const MOUSE = new CanvasMouseHandler();

const ANIMATION = new AnimatedTurtleTree(7);

// Add scores here
/**@type {import("../lablib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  scores: {
    tree: ANIMATION.score,
  },
};

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

class SoundScene {
  /**
   * Constructor
   * @param {SoundManager} sound Reference to the sound manager
   */
  constructor(sound) {
    this.sound = sound;
    this.mute_button = new MuteButton();
    this.events = new EventTarget();

    this.sound.play_score("tree");

    // Schedule sound callbacks here
    this.mute_button.events.addEventListener(
      "change",
      (/** @type {CustomEvent}*/ e) => {
        this.sound.toggle_sound(e.detail.sound_on);
      }
    );
  }

  update() {
    // state changes each frame go here
    // note that you can do this.sound.get_param(param_id) if the score
    // has animations
  }

  render() {
    const mute = this.mute_button.render();
    const animation = ANIMATION.render(this.sound);
    return group(animation, mute);
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
      document.getElementById("sketch-canvas")
    ).elt;

    MOUSE.setup(canvas);

    scene.events.addEventListener("scene-change", () => {
      scene = new SoundScene(SOUND);
    });
  };

  p.draw = () => {
    p.background(0);

    scene.update();

    const scene_primitive = scene.render();
    draw_primitive(p, scene_primitive);
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
