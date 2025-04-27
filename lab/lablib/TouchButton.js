import { Point } from "../../pga2d/objects.js";
import { Color } from "../../sketchlib/Color.js";
import { GroupPrimitive, RectPrimitive } from "../../sketchlib/primitives.js";
import { Style } from "../../sketchlib/Style.js";
import { Rectangle } from "./Rectangle.js";

/**
 * @enum {number}
 */
export const ButtonState = {
  IDLE: 0,
  PRESSED: 1,
  HOVER: 2,
};

/**
 * A virtual button represented as a rectangle on screen.
 */
export class TouchButton {
  /**
   * Constructor
   * @param {Rectangle} rect The boundary rectangle of this button
   */
  constructor(rect) {
    this.rect = rect;
    this.state = ButtonState.IDLE;

    /**
     * Events for the button
     * click(void) - if the button was released after being pressed
     * @type {EventTarget}
     */
    this.events = new EventTarget();
  }

  /**
   * Check if the button is currently pressed
   */
  get is_pressed() {
    return this.state === ButtonState.PRESSED;
  }

  get_debug_style() {
    switch (this.state) {
      case ButtonState.IDLE:
        return Style.DEFAULT_STROKE;
      case ButtonState.HOVER:
        return Style.DEFAULT_STROKE_FILL;
      case ButtonState.PRESSED:
        return Style.DEFAULT_STROKE.with_fill(Color.BLUE);
    }
  }

  debug_render() {
    const rect = new RectPrimitive(this.rect.position, this.rect.dimensions);

    return new GroupPrimitive([rect], this.get_debug_style());
  }

  /**
   * Mouse pressed handler
   * @param {Point} mouse_coords The mouse coords from the event
   */
  mouse_pressed(mouse_coords) {
    if (!this.rect.contains(mouse_coords)) {
      this.state = ButtonState.IDLE;
      return;
    }

    this.state = ButtonState.PRESSED;
  }

  /**
   * Mouse released handler
   * @param {Point} mouse_coords The mouse coords from the event
   */
  mouse_released(mouse_coords) {
    if (this.rect.contains(mouse_coords)) {
      this.events.dispatchEvent(new CustomEvent("click"));
      this.state = ButtonState.HOVER;
    } else {
      this.state = ButtonState.IDLE;
    }
  }

  /**
   * Mouse moved handler
   * @param {Point} mouse_coords The mouse coords from the event
   */
  mouse_moved(mouse_coords) {
    if (!this.rect.contains(mouse_coords)) {
      this.state = ButtonState.IDLE;
      return;
    }

    if (this.state !== ButtonState.PRESSED) {
      this.state = ButtonState.HOVER;
    }
  }

  /**
   * Mouse dragged handler
   * @param {Point} mouse_coords The mouse coords from the event
   */
  mouse_dragged(mouse_coords) {
    if (!this.rect.contains(mouse_coords)) {
      this.state = ButtonState.IDLE;
      return;
    }

    this.state = ButtonState.PRESSED;
  }
}
