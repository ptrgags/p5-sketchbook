import { PlayButton } from "./PlayButton.js";

export class PlayButtonScene {
  constructor() {
    this.play_button = new PlayButton();

    this.events = new EventTarget();

    this.play_button.events.addEventListener("click", () => {
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
    this.play_button.mouse_released(input);
  }
}
