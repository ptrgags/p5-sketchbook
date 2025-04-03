import { Direction } from "../sketchlib/Direction.js";

export const ARROW_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
export const WASD_KEYS = ["KeyW", "KeyA", "KeyS", "KeyD"];

/**
 * @typedef {"ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown"} ArrowKey
 * @typedef {"KeyW" | "KeyA" | "KeyS" | "KeyD"} WASDKey
 */

export class DPad {
  constructor() {
    this.direction = undefined;

    this.keys_down = [false, false, false, false];
  }

  /**
   * Handle an arrow/WASD key pressed event
   * @param {ArrowKey | WASDKey} dpad_key
   */
  pressed(dpad_key) {
    const direction = DPad.get_direction(dpad_key);
    this.keys_down[direction] = true;
    this.direction = direction;
  }

  /**
   * Handle an arrow/WASD key released. If there are other keys currently
   * pressed, it will switch to the first key it finds in CCW order from right
   * @param {ArrowKey | WASDKey} dpad_key The key to check
   */
  released(dpad_key) {
    const direction = DPad.get_direction(dpad_key);
    this.keys_down[direction] = false;

    // If there were other arrow keys pressed, switch to the first one
    // we find.
    const index = this.keys_down.findIndex((x) => x === true);
    if (index !== -1) {
      this.direction = index;
    } else {
      this.direction = undefined;
    }
  }

  /**
   * Convert a keyboard arrow key to a direction
   * @param {ArrowKey | WASDKey} key The keyboard key
   * @returns {Direction} The corresponding direction
   */
  static get_direction(key) {
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
    return undefined;
  }

  /**
   * Check if a key is an arrow key or WASD
   * @param {string} key The keyboard key
   * @returns {boolean} True if the key is an arrow or WASD
   */
  static is_dpad_key(key) {
    return ARROW_KEYS.includes(key) || WASD_KEYS.includes(key);
  }
}
