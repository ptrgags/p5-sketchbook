import { Point } from "../../pga2d/objects.js";
import { Color } from "../../sketchlib/Color.js";
import { GroupPrimitive } from "../../sketchlib/rendering/GroupPrimitive.js";
import { RectPrimitive } from "../../sketchlib/rendering/primitives.js";
import { Style } from "../../sketchlib/Style.js";
import { Rectangle } from "./Rectangle.js";
import { ButtonState, TouchButton } from "./TouchButton.js";

/**
 * One of the states of the toggle button, since we don't know the
 * interpretation
 * @enum {number}
 */
export const ToggleState = {
  STATE_A: 0,
  STATE_B: 1,
};

/**
 * Toggle a toggle state
 * @param {ToggleState} state
 * @returns {ToggleState}
 */
function toggle(state) {
  return state === ToggleState.STATE_A
    ? ToggleState.STATE_B
    : ToggleState.STATE_A;
}

export class ToggleButton {
  /**
   * Constructor
   * @param {Rectangle} rect The boundary rectangle
   * @param {ToggleState} initial_value The initial state of the toggle
   */
  constructor(rect, initial_value) {
    this.button = new TouchButton(rect);
    this.toggle_state = initial_value;
    this.events = new EventTarget();

    this.button.events.addEventListener("click", () => {
      this.toggle_state = toggle(this.toggle_state);
      this.events.dispatchEvent(
        new CustomEvent("toggle", { detail: this.toggle_state })
      );
    });
  }

  /**
   * Get the underlying button state for custom styling
   * @type {ButtonState}
   */
  get button_state() {
    return this.button.state;
  }

  get rect() {
    return this.button.rect;
  }

  debug_render() {
    const rect = new RectPrimitive(this.rect.position, this.rect.dimensions);

    const style =
      this.toggle_state === ToggleState.STATE_A
        ? Style.DEFAULT_FILL
        : new Style({ fill: Color.MAGENTA });

    return style(rect, { style });
  }

  /**
   * Mouse pressed handler
   * @param {Point} mouse_coords The mouse coords from the event
   */
  mouse_pressed(mouse_coords) {
    this.button.mouse_pressed(mouse_coords);
  }

  /**
   * Mouse released handler
   * @param {Point} mouse_coords The mouse coords from the event
   */
  mouse_released(mouse_coords) {
    this.button.mouse_released(mouse_coords);
  }

  /**
   * Mouse moved handler
   * @param {Point} mouse_coords The mouse coords from the event
   */
  mouse_moved(mouse_coords) {
    this.button.mouse_moved(mouse_coords);
  }

  /**
   * Mouse dragged handler
   * @param {Point} mouse_coords The mouse coords from the event
   */
  mouse_dragged(mouse_coords) {
    this.button.mouse_dragged(mouse_coords);
  }
}
