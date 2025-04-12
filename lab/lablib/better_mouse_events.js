import { fix_mouse_coords } from "../../sketchlib/fix_mouse_coords.js";
import { MouseInCanvas, MouseInput, MousePressed } from "./MouseInput.js";
import { SCREEN_RECT } from "./Rectangle.js";
/**
 * @typedef {function(MouseInput):void} MouseCallback
 */

/**
 * Create a better mouse pressed event that:
 * - uses fix_mouse_coords to adjust mouse coords even if the
 * - ignores events outside the canvas
 * - events in the canvas will cancel the browser default behavior since this
 * can interfere with the sketch. Events outside the canvas are passed through
 * as usual
 *
 * Note that this assumes the default canvas dimensions of WIDTH and HEIGHT
 * @param {any} p the p5.js element
 * @param {HTMLCanvasElement} canvas The canvas element
 * @param {MouseCallback} callback The callback to call when the mouse is pressed on the canvas
 */
export function mouse_pressed(p, canvas, callback) {
  p.mousePressed = (/** @type {MouseEvent} */ e) => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    if (!SCREEN_RECT.contains(mouse)) {
      return;
    }

    e.preventDefault();
    const input = new MouseInput(
      mouse,
      MousePressed.PRESSED,
      MouseInCanvas.IN_CANVAS
    );
    callback(input);
  };
}

/**
 * Similar to mouse_pressed but for the mouse released event
 * @param {any} p the p5.js element
 * @param {HTMLCanvasElement} canvas The canvas element
 * @param {MouseCallback} callback The callback to call when the mouse is pressed on the canvas
 */
export function mouse_released(p, canvas, callback) {
  p.mouseReleased = (/**@type {MouseEvent} */ e) => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    if (!SCREEN_RECT.contains(mouse)) {
      return;
    }

    e.preventDefault();
    const input = new MouseInput(
      mouse,
      MousePressed.NOT_PRESSED,
      MouseInCanvas.IN_CANVAS
    );
    callback(input);
  };
}

/**
 * When the mouse is moved
 * - Always prevent the default behavior
 *
 * @param {any} p the p5.js element
 * @param {HTMLCanvasElement} canvas The canvas element
 * @param {MouseCallback} callback The callback to call when the mouse is moved on the canvas
 */
export function mouse_moved(p, canvas, callback) {
  p.mouseMoved = (/**@type {MouseEvent} */ e) => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    const in_canvas = SCREEN_RECT.contains(mouse);
    if (in_canvas) {
      e.preventDefault();
    }

    const in_canvas_state = in_canvas
      ? MouseInCanvas.IN_CANVAS
      : MouseInCanvas.NOT_IN_CANVAS;

    const input = new MouseInput(
      mouse,
      MousePressed.NOT_PRESSED,
      in_canvas_state
    );
    callback(input);
  };
}

/**
 * Similar to mouse_moved, but now the mouse is pressed
 * @param {any} p the p5.js element
 * @param {HTMLCanvasElement} canvas The canvas element
 * @param {MouseCallback} callback The callback to call when the mouse is dragged on the canvas
 */
export function mouse_dragged(p, canvas, callback) {
  p.mouseDragged = (/**@type {MouseEvent} */ e) => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    const in_canvas = SCREEN_RECT.contains(mouse);
    if (in_canvas) {
      e.preventDefault();
    }

    const in_canvas_state = in_canvas
      ? MouseInCanvas.IN_CANVAS
      : MouseInCanvas.NOT_IN_CANVAS;

    const input = new MouseInput(mouse, MousePressed.PRESSED, in_canvas_state);
    callback(input);
  };
}
