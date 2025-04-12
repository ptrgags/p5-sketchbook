import { GroupPrimitive, RectPrimitive } from "../../sketchlib/primitives.js";
import { Color, Style } from "../../sketchlib/Style.js";
import { Rectangle } from "./Rectangle.js";
import { TouchButton } from "./TouchButton.js";

export class ToggleButton {
  /**
   * Constructor
   * @param {Rectangle} rect The boundary rectangle
   * @param {boolean} initial_value The initial state of the toggle
   */
  constructor(rect, initial_value) {
    this.button = new TouchButton(rect);
    this.value = initial_value;
  }

  get rect() {
    return this.button.rect;
  }

  debug_render() {
    const rect = new RectPrimitive(this.rect.position, this.rect.dimensions);

    const style = this.value
      ? new Style({ fill: Color.MAGENTA })
      : Style.DEFAULT_FILL;

    return new GroupPrimitive([rect], style);
  }

  mouse_pressed(mouse_coords) {
    this.button.mouse_pressed(mouse_coords);
  }

  mouse_released(mouse_coords) {
    this.button.mouse_released(mouse_coords);

    if (this.rect.contains(mouse_coords)) {
      this.value = !this.value;
    }
  }

  mouse_moved(mouse_coords) {
    this.button.mouse_moved(mouse_coords);
  }

  mouse_dragged(mouse_coords) {
    this.button.mouse_dragged(mouse_coords);
  }
}
