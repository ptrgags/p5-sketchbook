import { Direction } from "./Direction.js";
import { Line } from "./Line.js";
import { Even, Odd } from "./multivectors.js";
import { Point } from "./Point.js";

/**
 * A motor is an even versor. in 2D PGA, these are rotations and translations.
 */
export class Motor {
  /**
   * Construct a motor from an even multivector
   * @param {Even} even The multivector
   */
  constructor(even) {
    this.even = even;
  }

  /**
   * Compute the reverse of this motor. For rotations, this is the same as
   * the inverse, but slightly less calculations
   * @returns {Motor} the reverse of this motor
   */
  reverse() {
    return new Motor(this.even.reverse());
  }

  /**
   * Rotate counterclockwise around the given point (in a y-up coordinate system)
   * @param {Point} point The point to rotate around. This must be a euclidean point!
   * @param {number} angle The angle in radians. Positive is counterclockwise
   * @returns {Motor} the rotation versor.
   */
  static rotation(point, angle) {
    const c = Math.cos(angle / 2);
    const s = Math.sin(angle / 2);
    const { x, y } = point;
    // point = X * yo - Y * xo + xy
    // the versor cos(theta/2) + sin(theta / 2)(point) is for a clockwise rotation
    // we want a counterclockwise one, so we take the reverse
    // c + s * (-X * yo + Y * xo - xy)

    const versor = new Even(c, -s, s * y, -s * x);
    return new Motor(versor);
  }

  /**
   * Transform a line
   * @param {Line} line The line to transform
   * @returns {Line} the transformed line
   */
  transform_line(line) {
    const vec = this.even.sandwich_odd(line.vec);
    return Line.from_vec(vec);
  }

  /**
   * Transform a point
   * @param {Point} point The point to transform
   * @returns {Point} the transformed point
   */
  transform_point(point) {
    const bivec = this.even.sandwich_even(point.bivec);
    return Point.from_bivec(bivec);
  }

  /**
   * Transform a direction
   * @param {Direction} dir The direction to transform
   * @returns {Direction}
   */
  transform_dir(dir) {
    const bivec = this.even.sandwich_even(dir.bivec);
    return Direction.from_bivec(bivec);
  }

  toString() {
    return `Motor(${this.even})`;
  }
}
Motor.ROT90 = Object.freeze(Motor.rotation(Point.ORIGIN, Math.PI / 2));

/**
 * A flector is an odd versor. This includes reflections and glide reflections
 */
export class Flector {
  /**
   * Constructor
   * @param {Odd} odd The underlying odd object
   */
  constructor(odd) {
    this.odd = odd;
  }

  /**
   * Reflect in the given line
   * @param {Line} line The line
   * @returns {Flector} The reflection versor
   */
  static reflection(line) {
    return new Flector(line.vec);
  }

  /**
   * Transform a line
   * @param {Line} line The line to transform
   * @returns {Line} The transformed line
   */
  transform_line(line) {
    const vec = this.odd.sandwich_odd(line.vec);
    return Line.from_vec(vec);
  }

  /**
   * Transform a point
   * @param {Point} point the point to transform
   * @returns {Point} the transformed point
   */
  transform_point(point) {
    const bivec = this.odd.sandwich_even(point.bivec);
    return Point.from_bivec(bivec);
  }

  /**
   * Transform a direction
   * @param {Direction} dir the point to transform
   * @returns {Direction} the transformed point
   */
  transform_dir(dir) {
    const bivec = this.odd.sandwich_even(dir.bivec);
    return Direction.from_bivec(bivec);
  }

  toString() {
    return `Flector(${this.odd})`;
  }
}
