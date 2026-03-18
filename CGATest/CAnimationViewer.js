import { CAnimated } from "../sketchlib/cga2d/CAnimated.js";
import { CNode } from "../sketchlib/cga2d/CNode.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";

/**
 * Set up a scene with a CAnimated mapped to the screen
 * @implements {CAnimated}
 */
export class CAnimationViewer {
  /**
   * Constructor
   * @param {CVersor} to_screen
   * @param {CAnimated} animation
   */
  constructor(to_screen, animation) {
    this.animation = animation;
    this.primitive = new CNode(to_screen, animation.primitive);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    this.animation.update(time);
  }
}
