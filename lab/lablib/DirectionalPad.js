import { Point } from "../../pga2d/objects.js";
import { HEIGHT } from "../../sketchlib/dimensions.js";
import { Direction, to_y_down } from "../../sketchlib/Direction.js";
import { GroupPrimitive } from "../../sketchlib/primitives.js";
import { DirectionInput } from "./DirectionInput.js";
import { KeyboardDPad } from "./KeyboardDPad.js";
import { MouseInput } from "./MouseInput.js";
import { Rectangle } from "./Rectangle.js";
import { TouchDPad } from "./TouchDPad.js";

const DPAD_DIMENSIONS = Point.direction(200, 200);
const MARGIN = 10;
const DPAD_ORIGIN = Point.point(MARGIN, HEIGHT - DPAD_DIMENSIONS.y - MARGIN);
const DEAD_ZONE_RADIUS = 0.01;

export class DirectionalPad {
  constructor() {
    this.touch_dpad = new TouchDPad(
      new Rectangle(DPAD_ORIGIN, DPAD_DIMENSIONS),
      DEAD_ZONE_RADIUS
    );
    this.keyboard_dpad = new KeyboardDPad("both");
    this.touch_pad_visible = true;

    /**
     * @type {EventTarget}
     */
    this.events = new EventTarget();
  }

  setup() {
    this.keyboard_dpad.setup();
  }

  render() {
    if (this.touch_pad_visible) {
      return this.touch_dpad.render();
    }

    return new GroupPrimitive([]);
  }

  /**
   * Handle the key pressed event
   * @param {string} code The key code
   */
  key_pressed(code) {
    if (!this.keyboard_dpad.is_dpad_key(code)) {
      return;
    }

    // Update the keyboard state
    this.keyboard_dpad.pressed(code);
    this.events.dispatchEvent(
      new CustomEvent("dir-pressed", { detail: this.keyboard_dpad.direction })
    );
  }

  /**
   * Handle the key released event.
   * @param {string} code The event.code for the keyboard event
   */
  key_released(code) {
    if (!this.keyboard_dpad.is_dpad_key(code)) {
      return;
    }

    this.keyboard_dpad.released(code);

    this.events.dispatchEvent(
      new CustomEvent("dir-released", { detail: this.keyboard_dpad.direction })
    );
  }

  mouse_pressed(mouse_coords) {
    this.touch_dpad.mouse_pressed(mouse_coords);

    this.events.dispatchEvent(
      new CustomEvent("dir-pressed", { detail: this.touch_dpad.direction })
    );
  }

  /**
   * @param {MouseInput} mouse_input Mouse input state
   */
  mouse_dragged(mouse_input) {
    this.touch_dpad.mouse_dragged(mouse_input);

    this.events.dispatchEvent(
      new CustomEvent("dir-pressed", { detail: this.touch_dpad.direction })
    );
  }

  mouse_released() {
    this.touch_dpad.mouse_released();

    this.events.dispatchEvent(
      new CustomEvent("dir-released", { detail: this.touch_dpad.direction })
    );
  }
}
export { DirectionInput };
