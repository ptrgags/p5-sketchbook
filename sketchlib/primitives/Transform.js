import { Direction } from "../../pga2d/Direction.js";

/**
 * A transformation that can be converted to p5 commands. Right now
 * this only supports translation
 */
export class Transform {
  /**
   * Constructor
   * @param {Direction} translation The translation amount
   */
  constructor(translation) {
    this.translation = translation;
  }
}
