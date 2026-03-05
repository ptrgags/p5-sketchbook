import { Animated } from "../animation/Animated.js";
import { MouseCallbacks } from "../input/MouseCallbacks.js";
import { PlayButton } from "../input/PlayButton.js";
import { Scene } from "./Scene.js";
import { SoundManager } from "../SoundManager.js";

/**
 * @implements {Scene}
 * @implements {Animated}
 */
export class PlayButtonScene {
  /**
   * Constructor
   * @param {SoundManager} sound
   */
  constructor(sound) {
    this.sound = sound;
    this.play_button = new PlayButton();

    this.events = new EventTarget();

    this.play_button.events.addEventListener("click", async () => {
      await this.sound.init();

      const change_of_scene = new CustomEvent("scene-change");
      this.events.dispatchEvent(change_of_scene);
    });

    this.primitive = this.play_button.primitive;
  }

  update() {
    this.play_button.update();
  }

  /**
   * @type {MouseCallbacks[]}
   */
  get mouse_callbacks() {
    return [this.play_button.mouse_callbacks];
  }
}
