import { Point } from "../pga2d/objects.js";

export class PerspectiveQuad {
  /**
   * Constructor
   * @param {Point} a First point in CCW order
   * @param {Point} b Second point in CCW order
   * @param {Point} c Third point in CCW order
   * @param {Point} d Fourth point in CCW order
   */
  constructor(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }
}
