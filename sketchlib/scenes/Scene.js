import { MouseCallbacks } from "../input/MouseCallbacks.js";

/**
 * @interface Scene
 */
export class Scene {
  /**
   * A scene can trigger events
   * @type {EventTarget}
   */
  get events() {
    throw new Error("not implemented");
  }

  /**
   * An array of objects that have mouse
   * handlers that need to be wired to the
   * p5 mouse events.
   * @type {MouseCallbacks[]}
   */
  get mouse_events() {
    throw new Error("not implemented");
  }
}
