import { Animated } from "../animation/Animated.js";
import { MouseCallbacks } from "../input/MouseCallbacks.js";
import { MuteButton } from "../MuteButton.js";
import { group } from "../primitives/shorthand.js";
import { SoundManager } from "../SoundManager.js";
import { Scene } from "./Scene.js";

/**
 * @implements {Scene}
 */
export class SoundScene {
  /**
   * Constructor
   * @param {SoundManager} sound
   * @param {Animated} animation The animation to display
   */
  constructor(sound, animation) {
    this.sound = sound;
    this.animation = animation;

    this.events = new EventTarget();

    this.mute_button = new MuteButton(sound);

    this.primitive = group(
      this.animation.primitive,
      this.mute_button.primitive,
    );
  }

  /**
   * @type {MouseCallbacks[]}
   */
  get mouse_callbacks() {
    return [this.mute_button.mouse_callbacks];
  }

  update() {
    const time = this.sound.transport_time;
    this.mute_button.update();
    this.animation.update(time);
  }
}
