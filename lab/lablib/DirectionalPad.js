import { Point } from "../../pga2d/objects.js";
import { HEIGHT } from "../../sketchlib/dimensions.js";
import { Direction } from "../../sketchlib/Direction.js";
import { KeyboardDPad } from "./KeyboardDPad.js";
import { Rectangle } from "./Rectangle.js";
import { TouchDPad } from "./TouchDPad.js";

const DPAD_DIMENSIONS = Point.direction(200, 200);
const MARGIN = 10;
const DPAD_ORIGIN = Point.point(MARGIN, HEIGHT - DPAD_DIMENSIONS.y - MARGIN);
const DEAD_ZONE_RADIUS = 0.01;

export class DirectionInput {
  /**
   *
   * @param {Direction | undefined} digital The direction that was pressed as a
   * cardinal direction, or undefined if there's no input
   * @param {Point} analog The direction that was pressed as an analog value.
   * It is either Point.ZERO (no input)
   */
  constructor(digital, analog) {
    this.digital = digital;
    this.analog = analog;
  }
}

export class DirectionalPad {
  constructor() {
    this.touch_dpad = new TouchDPad(
      new Rectangle(DPAD_ORIGIN, DPAD_DIMENSIONS),
      DEAD_ZONE_RADIUS
    );
    this.keyboard_dpad = new KeyboardDPad("both");
    this.touch_pad_visible = true;
    this.events = new EventTarget();
  }

  setup() {
    this.keyboard_dpad.setup();
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

    // Check if we should emit a direction pressed event
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

    // check if we should emit a direction pressed event
  }
}
