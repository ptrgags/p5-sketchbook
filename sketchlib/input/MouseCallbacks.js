import { MouseInput } from "./MouseInput.js";

/**
 * Mouse callback events. An object implementing this interface
 * must implement at least one of these functions.
 * @interface MouseCallbacks
 */
export class MouseCallbacks {
  /**
   * Mouse pressed event
   * @type {function(MouseInput): void}
   */
  mouse_pressed = undefined;
  /**
   * Mouse moved event
   * @type {function(MouseInput): void}
   */
  mouse_moved = undefined;
  /**
   * Mouse dragged event
   * @type {function(MouseInput): void}
   */
  mouse_dragged = undefined;
  /**
   * Mouse released event
   * @type {function(MouseInput): void}
   */
  mouse_released = undefined;

  /**
   * An object is MouseCallbacks if and only if it has at least one of
   * the mouse callback functions
   * @param {any} x
   * @returns {x is MouseCallbacks}
   */
  static has_callbacks(x) {
    const callbacks = [
      x.mouse_pressed,
      x.mouse_dragged,
      x.mouse_released,
      x.mouse_moved,
    ];
    return callbacks.some((x) => x !== undefined);
  }
}
