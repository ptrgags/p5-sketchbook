import { Point } from "../../pga2d/objects.js";

/**
 * A transformation that can be converted to p5 commands. Right now
 * this only supports translation
 */
export class Transform {
  /**
   * Constructor
   * @param {Point} translation The translation amount
   */
  constructor(translation) {
    this.translation = translation;
  }
}
