import { Point } from "../../pga2d/objects.js";
import { HEIGHT } from "../../sketchlib/dimensions.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { DirectionInput } from "./DirectionInput.js";
import { KeyboardDPad } from "./KeyboardDPad.js";
import { MouseInput } from "./MouseInput.js";
import { Rectangle } from "./Rectangle.js";
import { TouchDPad } from "./TouchDPad.js";

const DPAD_DIMENSIONS = new Direction(200, 200);
const MARGIN = 10;
const DPAD_ORIGIN = new Point(MARGIN, HEIGHT - DPAD_DIMENSIONS.y - MARGIN);
const DEAD_ZONE_RADIUS = 0.01;

export class DirectionalPad {
  constructor() {
    this.touch_dpad = new TouchDPad(
      new Rectangle(DPAD_ORIGIN, DPAD_DIMENSIONS),
      DEAD_ZONE_RADIUS
    );
    this.keyboard_dpad = new KeyboardDPad("both");
    this.touch_pad_visible = true;
  }

  setup() {
    this.keyboard_dpad.setup();
  }

  render() {
    if (this.touch_pad_visible) {
      return this.touch_dpad.render();
    }

    return GroupPrimitive.EMPTY;
  }

  get direction() {
    return DirectionInput.first_nonzero(
      this.keyboard_dpad.direction,
      this.touch_dpad.direction
    );
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
  }

  mouse_pressed(mouse_coords) {
    this.touch_dpad.mouse_pressed(mouse_coords);
  }

  /**
   * @param {MouseInput} mouse_input Mouse input state
   */
  mouse_dragged(mouse_input) {
    this.touch_dpad.mouse_dragged(mouse_input);
  }

  mouse_released() {
    this.touch_dpad.mouse_released();
  }
}
export { DirectionInput };
