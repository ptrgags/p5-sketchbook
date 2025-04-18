import { Point } from "../../pga2d/objects.js";
import { Direction, to_y_down } from "../../sketchlib/Direction.js";
import { DirectionInput } from "./DirectionInput.js";

export const ARROW_CODES = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
export const WASD_CODES = ["KeyW", "KeyA", "KeyS", "KeyD"];

/**
 * @typedef {"ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown"} ArrowCode
 * @typedef {"KeyW" | "KeyA" | "KeyS" | "KeyD"} WASDCode
 */

/**
 * Convert a keyboard arrow key to a direction
 * @param {ArrowCode | WASDCode} key The keyboard key
 * @returns {Direction} The corresponding direction
 */
function get_direction(key) {
  switch (key) {
    case "ArrowLeft":
    case "KeyA":
      return Direction.LEFT;
    case "ArrowRight":
    case "KeyD":
      return Direction.RIGHT;
    case "ArrowUp":
    case "KeyW":
      return Direction.UP;
    case "ArrowDown":
    case "KeyS":
      return Direction.DOWN;
  }
}

function prevent_keyboard_scroll() {
  window.addEventListener("keydown", (e) => {
    if (ARROW_CODES.includes(e.code)) {
      e.preventDefault();
    }
  });
}

/**
 * Directional pad that uses keyboard input (arrows and/or WASD)
 */
export class KeyboardDPad {
  /**
   * Constructor
   * @param {"arrows" | "wasd" | "both"} keys_allowed Whether to use arrows, WASD or both
   */
  constructor(keys_allowed) {
    this.keys_down = [false, false, false, false];
    this.keys_allowed = keys_allowed;

    this.direction = DirectionInput.NO_INPUT;
  }

  setup() {
    if (this.keys_allowed == "arrows" || this.keys_allowed == "both") {
      prevent_keyboard_scroll();
    }
  }

  /**
   * Handle an arrow/WASD key pressed event.
   * @param {ArrowCode | WASDCode} dpad_code The event.code
   */
  pressed(dpad_code) {
    const direction = get_direction(dpad_code);
    this.keys_down[direction] = true;
    this.direction = new DirectionInput(direction, to_y_down(direction));
  }

  /**
   * Handle a keyboard released event
   * @param {ArrowCode | WASDCode} dpad_code The event.code
   */
  released(dpad_code) {
    const direction = get_direction(dpad_code);
    this.keys_down[direction] = false;

    // If there were other arrow keys pressed, switch to the first one
    // we find.
    const fallback_direction = this.keys_down.findIndex((x) => x === true);
    if (fallback_direction !== -1) {
      this.direction = new DirectionInput(
        fallback_direction,
        to_y_down(fallback_direction)
      );
    } else {
      this.direction = DirectionInput.NO_INPUT;
    }
  }

  /**
   * Check if a keyboard event should be handled.
   * @param {string} code The raw key code. Use e.code, not p.keyCode
   * @returns {code is (ArrowCode | WASDCode)}
   */
  is_dpad_key(code) {
    switch (this.keys_allowed) {
      case "arrows":
        return ARROW_CODES.includes(code);
      case "wasd":
        return WASD_CODES.includes(code);
      case "both":
        return ARROW_CODES.includes(code) || WASD_CODES.includes(code);
    }
  }
}
