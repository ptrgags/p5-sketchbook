import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";

export class Basis3 {
  /**
   * Constructor
   * @param {Point} origin Origin point
   * @param {Direction} basis_x x-direction in screen space
   * @param {Direction} basis_y y-direction in screen space
   * @param {Direction} basis_z z-direction in screen space
   */
  constructor(origin, basis_x, basis_y, basis_z) {
    this.origin = origin;
    this.basis_x = basis_x;
    this.basis_y = basis_y;
    this.basis_z = basis_z;
  }

  /**
   * Get the absolute position on the screen for given pixels
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Point} The absolute position
   */
  position(x, y, z) {
    const px =
      this.origin.x +
      x * this.basis_x.x +
      y * this.basis_y.x +
      z * this.basis_z.x;
    const py =
      this.origin.y +
      x * this.basis_x.y +
      y * this.basis_y.y +
      z * this.basis_z.y;
    return new Point(px, py);
  }

  /**
   * Return the relative offset from the origin
   * @param {number} x x-coordinate
   * @param {number} y y-coordinate
   * @param {number} z z-coordinate
   * @returns {Direction} The displacement
   */
  displacement(x, y, z) {
    const px = x * this.basis_x.x + y * this.basis_y.x + z * this.basis_z.x;
    const py = x * this.basis_x.y + y * this.basis_y.y + z * this.basis_z.y;
    return new Direction(px, py);
  }
}
