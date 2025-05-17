import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { GroupPrimitive } from "../../sketchlib/primitives.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { MuteButton } from "../lablib/MuteButton.js";
import { PlayButtonScene } from "../lablib/PlayButtonScene.js";
import { SoundManager } from "../lablib/SoundManager.js";
import { Clock } from "./Clock.js";

const MOUSE = new CanvasMouseHandler();

/** @type {import("../lablib/SoundManager.js").SoundManifest} */
const SOUND_MANIFEST = {
  scores: {},
};

//@ts-ignore
const SOUND = new SoundManager(Tone, SOUND_MANIFEST);

class PendulumClockScene {
  constructor(sound) {
    this.sound = sound;
    this.clock = new Clock();
    this.mute_button = new MuteButton();
    this.events = new EventTarget();

    this.mute_button.events.addEventListener(
      "change",
      (/** @type {CustomEvent}*/ e) => {
        this.sound.toggle_sound(e.detail.sound_on);
      }
    );
  }

  update() {
    this.clock.update();
  }

  render() {
    const clock = this.clock.render();
    const mute_button = this.mute_button.render();
    return new GroupPrimitive([clock, mute_button]);
  }

  mouse_pressed(input) {
    this.mute_button.mouse_pressed(input);
  }
  mouse_moved(input) {
    this.mute_button.mouse_moved(input);
  }
  mouse_dragged(input) {
    this.mute_button.mouse_dragged(input);
  }
  mouse_released(input) {
    this.mute_button.mouse_released(input);
  }
}

export const sketch = (p) => {
  /**@type {PlayButtonScene | PendulumClockScene} */
  let scene = new PlayButtonScene(SOUND);
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;

    MOUSE.setup(canvas);

    scene.events.addEventListener("scene-change", () => {
      scene = new PendulumClockScene(SOUND);
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
