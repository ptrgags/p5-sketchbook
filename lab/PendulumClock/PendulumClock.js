import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { CanvasMouseHandler } from "../lablib/CanvasMouseHandler.js";
import { PlayButtonScene } from "../lablib/PlayButtonScene.js";
import { SoundManager } from "../lablib/SoundManager.js";
import { Clock } from "./Clock.js";

const MOUSE = new CanvasMouseHandler();

//@ts-ignore
const SOUND = new SoundManager(Tone);

class PendulumClockScene {
  constructor() {
    this.clock = new Clock();
    this.events = new EventTarget();
  }

  update() {
    this.clock.update();
  }

  render() {
    return this.clock.render();
  }

  mouse_pressed() {}
  mouse_moved() {}
  mouse_dragged() {}
  mouse_released() {}
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
      scene = new PendulumClockScene();
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
