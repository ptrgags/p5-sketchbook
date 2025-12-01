import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { LSystem } from "../../sketchlib/LSystem.js";
import { draw_primitive } from "../../sketchlib/p5_helpers/draw_primitive.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { MouseInput } from "../lablib/MouseInput.js";
import { MuteButton } from "../lablib/MuteButton.js";
import { PlayButtonScene } from "../lablib/PlayButtonScene.js";
import { SoundManager } from "../lablib/SoundManager.js";

const MOUSE = new CanvasMouseHandler();

// Add scores here
/**@type {import("../lablib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {};

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

const TREE_LSYSTEM = new LSystem("Fa", {
  a: "[+Fa]-Fa",
});

function count_symbols(str) {
  /**
   * @type {Map<string, number>}
   */
  const counts = new Map();
  for (const c of str) {
    const current_count = counts.get(c) ?? 0;
    counts.set(c, current_count + 1);
  }

  return counts;
}

const strings = TREE_LSYSTEM.iterate(8);
for (const str of strings) {
  const counts = count_symbols(str);
  const ignore_a_len = str.length - counts.get("a");
  console.log(ignore_a_len, counts, str);
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

    // Schedule sound callbacks here
    // this.sound.events.addEventListener('event', (e) => ...);
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
