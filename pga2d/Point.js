import { is_nearly } from "../sketchlib/is_nearly.js";
import { Direction } from "./Direction.js";
import { Line } from "./Line.js";
import { Even } from "./multivectors.js";

/**
 * A generalzed point that can be either a Euclidean point, or an ideal
 * point (i.e. a direction).
 *
 * This is a wrapper around a bivector (an Even object) that normalizes
 * the representation so the xy component is either 1 or 0.
 *
 * Because this is a bivector, some operations like reflection might have
 * a different sign than you expect.
 */
export class Point {
  /**
   * Create a Euclidean point, i.e. the xy component is 1
   * @param {number} x The x coordinate
   * @param {number} y The y coordinate
   */
  constructor(x, y) {
    const xy = 1;
    const xo = -y;
    const yo = x;
    this.bivec = new Even(0, xy, xo, yo);
  }

  /**
   * Construct from a bivector
   * @param {Even} bivec The bivector that represents this point.
   */
  static from_bivec(bivec) {
    const { xy, xo, yo } = bivec;
    if (is_nearly(xy, 0)) {
      throw new Error("Trying to create a Point from a direction!");
    }

    const x = yo / xy;
    const y = -xo / xy;
    return new Point(x, y);
  }

  /**
   * Switch from a Point to a Direction representation (for convenience)
   * @returns {Direction}
   */
  to_direction() {
    return new Direction(this.x, this.y);
  }

  /**
   * @type {number}
   */
  get x() {
    return this.bivec.yo;
  }

  /**
   * @type {number}
   */
  get y() {
    return -this.bivec.xo;
  }

  /**
   * Get the dual line
   * @returns {Line} The dual line
   */
  dual() {
    const vec = this.bivec.dual();
    return Line.from_vec(vec);
  }

  /**
   * Add a direction to a Point, producing a new point.
   * @param {Direction} dir The direction to add
   */
  add(dir) {
    // the xy component will always be 1 + 0 = 1, so always a Point.
    const { xo, yo } = this.bivec.add(dir.bivec);
    const x = yo;
    const y = -xo;
    return new Point(x, y);
  }

  /**
   * Subtract two generalized points. This produces a direction from
   * other to self
   * @param {Point} other The other point
   * @returns {Direction} A direction from other to self
   */
  sub(other) {
    const { xo, yo } = this.bivec.sub(other.bivec);
    const x = yo;
    const y = -xo;
    return new Direction(x, y);
  }

  /**
   * Join this point to another point or direction, producing a line through
   * both.
   * @param {Point | Direction} other The other point or direction
   * @returns {Line} The line through the two points
   */
  join(other) {
    const vec = this.bivec.vee_even(other.bivec);
    return Line.from_vec(vec);
  }

  /**
   * Compute the squared distance between this point and another one
   * @param {Point} point another point
   * @returns {number}
   */
  dist_sqr(point) {
    return this.sub(point).mag_sqr();
  }

  /**
   * Compute distance to a point
   * @param {Point} point another point
   * @returns {number}
   */
  dist(point) {
    return Math.sqrt(this.dist_sqr(point));
  }

  /**
   * Return a point of the same type
   * @returns {Point} The result of flipping the y-coordinate
   */
  flip_y() {
    return new Point(this.x, -this.y);
  }

  /**
   *
   * @returns {string}
   */
  toString() {
    const x_str = this.x.toPrecision(3);
    const y_str = this.y.toPrecision(3);
    return `Point(${x_str}, ${y_str})`;
  }

  /**
   * @param {Point} other The point to check
   * @returns {boolean} true if objects are equal
   */
  equals(other) {
    return this.bivec.equals(other.bivec);
  }

  /**
   * Linearly interpolate between two points
   * @param {Point} a The first point
   * @param {Point} b The second point
   * @param {number} t The interpolation factor
   */
  static lerp(a, b, t) {
    const bivector = Even.lerp(a.bivec, b.bivec, t);
    return Point.from_bivec(bivector);
  }
}
Point.ORIGIN = Object.freeze(new Point(0, 0));
