import { fix_mouse_coords } from "../../sketchlib/fix_mouse_coords.js";
import { prevent_mobile_scroll } from "../../sketchlib/prevent_mobile_scroll.js";
import { MouseInCanvas, MouseInput, MousePressed } from "./MouseInput.js";
import { SCREEN_RECT } from "./Rectangle.js";
/**
 * @typedef {function(MouseInput):void} MouseCallback
 */

/**
 * Class that helps set up mouse events that detect whether the mouse is
 * on the canvas or out of the canvas.
 *
 * This class directly interacts with a p5 sketch
 */
export class CanvasMouseHandler {
  constructor() {
    /**
     * @type {HTMLCanvasElement}
     */
    this.canvas = undefined;
  }

  /**
   * Store the canvas, and prevent mobile scrolling
   * @param {HTMLCanvasElement} canvas The canvas element
   */
  setup(canvas) {
    this.canvas = canvas;
    prevent_mobile_scroll(canvas);
  }

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
   * @param {MouseCallback} callback The callback to call when the mouse is pressed on the canvas
   */
  mouse_pressed(p, callback) {
    p.mousePressed = (/** @type {MouseEvent} */ e) => {
      const mouse = fix_mouse_coords(this.canvas, p.mouseX, p.mouseY);
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
   *
   * @param {MouseCallback} callback The callback to call when the mouse is pressed on the canvas
   */
  mouse_released(p, callback) {
    p.mouseReleased = (/**@type {MouseEvent} */ e) => {
      const mouse = fix_mouse_coords(this.canvas, p.mouseX, p.mouseY);
      const in_canvas = SCREEN_RECT.contains(mouse);
      if (in_canvas && e.cancelable) {
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
   * When the mouse is moved
   * - If the mouse is hovering over the canvas, prevent the default behavior
   * - Always call the callback, but include the in-canvas state
   *
   * @param {any} p the p5.js element
   * @param {MouseCallback} callback The callback to call when the mouse is moved on the canvas
   */
  mouse_moved(p, callback) {
    p.mouseMoved = (/**@type {MouseEvent} */ e) => {
      const mouse = fix_mouse_coords(this.canvas, p.mouseX, p.mouseY);
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
   * @param {MouseCallback} callback The callback to call when the mouse is dragged on the canvas
   */
  mouse_dragged(p, callback) {
    p.mouseDragged = (/**@type {MouseEvent} */ e) => {
      const mouse = fix_mouse_coords(this.canvas, p.mouseX, p.mouseY);
      const in_canvas = SCREEN_RECT.contains(mouse);
      if (in_canvas) {
        e.preventDefault();
      }

      const in_canvas_state = in_canvas
        ? MouseInCanvas.IN_CANVAS
        : MouseInCanvas.NOT_IN_CANVAS;

      const input = new MouseInput(
        mouse,
        MousePressed.PRESSED,
        in_canvas_state
      );
      callback(input);
    };
  }
}
