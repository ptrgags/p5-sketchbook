import { Point } from "../../pga2d/objects";

/**
 * A transformation that can be converted to p5 commands. Right now
 * this only supports translation
 */
export class Transform {
  /**
   *
   * @param {Point} translation
   */
  constructor(translation) {
    this.translation = translation;
  }
}
