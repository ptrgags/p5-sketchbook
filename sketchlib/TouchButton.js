import { Point } from "../sketchlib/pga2d/Point.js";
import { Color } from "./Color.js";
import { RectPrimitive } from "./primitives/RectPrimitive.js";
import { style } from "./primitives/shorthand.js";
import { Style } from "./Style.js";
import { Rectangle } from "./Rectangle.js";
import { Animated } from "./animation/Animated.js";
import { MouseCallbacks } from "./input/MouseCallbacks.js";
import { MouseInput } from "./MouseInput.js";

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
 * @implements {Animated}
 * @implements {MouseCallbacks}
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
     * pressed(void) - when the button transitions from IDLE/HOVER -> PRESSED, this triggers once
     * released(void) - when the button transitions from PRESSED -> IDLE/HOVER, this triggers once
     * @type {EventTarget}
     */
    this.events = new EventTarget();

    const rect_prim = new RectPrimitive(
      this.rect.position,
      this.rect.dimensions,
    );
    this.primitive = style(rect_prim, this.style);
  }

  /**
   * Check if the button is currently pressed
   */
  get is_pressed() {
    return this.state === ButtonState.PRESSED;
  }

  update() {
    this.primitive.style = this.style;
  }

  get style() {
    switch (this.state) {
      case ButtonState.IDLE:
        return Style.DEFAULT_STROKE;
      case ButtonState.HOVER:
        return Style.DEFAULT_STROKE_FILL;
      case ButtonState.PRESSED:
        return Style.DEFAULT_STROKE.with_fill(Color.BLUE);
    }
  }

  /**
   * Transition to a new button state, triggering events when the pressed
   * state changes
   * @private
   * @param {ButtonState} new_state
   */
  transition(new_state) {
    if (this.is_pressed && new_state !== ButtonState.PRESSED) {
      this.events.dispatchEvent(new CustomEvent("released"));
    } else if (!this.is_pressed && new_state === ButtonState.PRESSED) {
      this.events.dispatchEvent(new CustomEvent("pressed"));
    }

    this.state = new_state;
  }

  /**
   * Mouse pressed handler
   * @param {MouseInput} input
   */
  mouse_pressed(input) {
    if (!this.rect.contains(input.mouse_coords)) {
      this.transition(ButtonState.IDLE);
      return;
    }

    this.transition(ButtonState.PRESSED);
  }

  /**
   * Mouse released handler
   * @param {MouseInput} input
   */
  mouse_released(input) {
    if (!this.rect.contains(input.mouse_coords)) {
      this.transition(ButtonState.IDLE);
      return;
    }

    if (this.is_pressed) {
      this.events.dispatchEvent(new CustomEvent("click"));
    }

    this.transition(ButtonState.HOVER);
  }

  /**
   * Mouse moved handler
   * @param {MouseInput} input
   */
  mouse_moved(input) {
    if (!this.rect.contains(input.mouse_coords)) {
      this.transition(ButtonState.IDLE);
      return;
    }

    if (this.state !== ButtonState.PRESSED) {
      this.transition(ButtonState.HOVER);
    }
  }

  /**
   * Mouse dragged handler
   * @param {MouseInput} input
   */
  mouse_dragged(input) {
    if (!this.rect.contains(input.mouse_coords)) {
      this.transition(ButtonState.IDLE);
      return;
    }

    this.transition(ButtonState.PRESSED);
  }
}
