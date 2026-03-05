import { Point } from "../pga2d/Point.js";

/**
 * @enum {number}
 */
export const MousePressed = {
  NOT_PRESSED: 0,
  PRESSED: 1,
};

/**
 * @enum {number}
 */
export const MouseInCanvas = {
  NOT_IN_CANVAS: 0,
  IN_CANVAS: 1,
};

export class MouseInput {
  /**
   * Mouse input event
   * @param {Point} mouse_coords A Point
   * @param {MousePressed} pressed If the mouse is pressed
   * @param {MouseInCanvas} in_canvas If the mouse is in the canvas
   */
  constructor(mouse_coords, pressed, in_canvas) {
    this.mouse_coords = mouse_coords;
    this.pressed = pressed;
    this.in_canvas = in_canvas;
  }
}
