import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Grid } from "../sketchlib/Grid.js";
import { clamp } from "../sketchlib/clamp.js";

export class Rect {
  /**
   * Consructor
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  constructor(x, y, width, height) {
    this.position = new Point(x, y);
    this.dimensions = new Direction(width, height);
  }
}
