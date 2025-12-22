import { PlayButton } from "./PlayButton.js";
import { SoundSystem } from "./sound/SoundSystem.js";

export class PlayButtonScene {
  /**
   * Constructor
   * @param {SoundSystem} sound The sound system
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
  }

  update() {}

  render() {
    return this.play_button.render();
  }

  mouse_pressed(input) {
    this.play_button.mouse_pressed(input);
  }

  mouse_moved(input) {
    this.play_button.mouse_moved(input);
  }

  mouse_dragged(input) {
    this.play_button.mouse_dragged(input);
  }

  mouse_released(input) {
    // Only release the mouse when we're ready for it.
    if (!this.sound.init_requested) {
      this.play_button.mouse_released(input);
    }
  }
}
