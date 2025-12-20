import { is_nearly } from "../sketchlib/is_nearly.js";
import { Even } from "./multivectors.js";
import { Point } from "./Point.js";

/**
 * An ideal point in geometric algebra, representing a direction. This
 * implementation has additional methods to have vector operations that
 * aren't usually included in the GA definition.
 *
 * This is a wrapper around a bivector (an Even object) that normalizes
 * the representation so the xy component 0. However, this is hidden to the
 * caller.
 */
export class Direction {
  /**
   * Create an ideal point, i.e. the xy component is 0. This represents a
   * point at infinity in the given direction
   * @param {number} x The x direction
   * @param {number} y The y direction
   */
  constructor(x, y) {
    const xy = 0;
    const xo = -y;
    const yo = x;
    this.bivec = new Even(0, xy, xo, yo);
  }

  /**
   * Get a direction from an angle
   * @param {number} theta Counterclockwise angle in radians
   * @returns {Direction} A direction with the coordinates (cos(theta), sin(theta))
   */
  static from_angle(theta) {
    return new Direction(Math.cos(theta), Math.sin(theta));
  }

  /**
   * Construct from a bivector
   * @param {Even} bivec The bivector that represents this point.
   */
  static from_bivec(bivec) {
    const { xy, xo, yo } = bivec;
    return new Point(xy, xo, yo);
  }

  to_point() {
    return new Point(this.x, this.y);
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
   * For a direction, this reverses the orientation. For a point, this
   * is a no-op due to homogeneity
   * @returns {Direction} The direction to negate
   */
  neg() {
    return new Direction(-this.x, -this.y);
  }

  /**
   * Get the magnitude of the direction, i.e. x^2 + y^2. In GA confusingly
   * this is called the ideal norm. I'm ignoring that for clarity.
   * @returns {number} The ideal norm squared
   */
  mag_sqr() {
    // this is the euclidean norm of the dual, but computed without allocating
    // the dual line
    const { yo: x, xo: y } = this.bivec;
    return x * x + y * y;
  }

  /**
   * The ideal norm, sqrt(x^2 + y^2)
   * @returns {number} The ideal norm squared
   */
  mag() {
    return Math.sqrt(this.mag_sqr());
  }

  /**
   * Normalize the point (if possible) by dividing by the norm
   * @returns {Direction} The point with unit length, or the original point for points with 0 norm
   */
  normalize() {
    const { x, y } = this;
    const length = this.mag();
    if (is_nearly(length, 0)) {
      return this;
    }

    return new Direction(x / length, y / length);
  }

  /**
   * Add another point. For directions, this works like vector addition. For points, this actually computes the midpoint due to homogeneity
   * @param {Point} other
   * @returns {Point} The sum of the two points
   */
  add(other) {
    const bivec = this.bivec.add(other.bivec);
    return Point.from_bivec(bivec);
  }

  /**
   * Subtract two generalized points. This can produce a direction or
   * a new point depending on whether the inputs are points/directions
   * @param {Point} other The other point
   * @returns {Point} The result of the subtraction
   */
  sub(other) {
    const { xy, xo, yo } = this.bivec.sub(other.bivec);
    return new Point(xy, xo, yo);
  }

  /**
   * Join two points into a line
   * @param {Point} other The other point to join into a line
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
    return this.sub(point).ideal_norm_sqr();
  }

  set_length(length) {
    const curr_length = this.ideal_norm();
    if (curr_length === 0) {
      throw new Error("Trying to set length of null vector");
    }

    const scale_factor = length / curr_length;
    return this.scale(scale_factor);
  }

  /**
   * Limit the length of a direction
   * @param {number} max_length
   * @returns {Point} The same direction with updated magnitude
   */
  limit_length(max_length) {
    const curr_length = this.ideal_norm();
    if (curr_length === 0) {
      return this;
    }

    const next_length = Math.min(curr_length, max_length);
    const scale_factor = next_length / curr_length;
    return this.scale(scale_factor);
  }

  /**
   * Uniformly scale the point.
   * @param {number} scalar The scale factor
   * @returns {Direction} the result of scaling
   */
  scale(scalar) {
    return new Direction(scalar * this.x, scalar * this.y);
  }

  /**
   * Component-wise multiplication of x and y coordinates. Not really
   * something done in geometric algebra, but very handy for computing
   * positions and dimensions in 2D grpahics
   * @param {Direction} other Another direction to multiply by
   */
  mul_components(other) {
    return new Direction(this.x * other.x, this.y * other.y);
  }

  /**
   * Flip the y-coordinate (useful since p5 is y-down)
   * @returns {Direction} The result of flipping the y-coordinate
   */
  flip_y() {
    return new Direction(this.x, -this.y);
  }

  /**
   * Compute the dot product of the x and y components of the points.
   * Technically this is the dot product of the duals
   * @param {Point} other The other point
   * @returns {number} The dot product.
   */
  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  toString() {
    const x_str = this.x.toPrecision(3);
    const y_str = this.y.toPrecision(3);
    return `Direction(${x_str}, ${y_str})`;
  }

  /**
   * @param {Direction} other The direction
   * @returns {boolean} true if objects are equal
   */
  equals(other) {
    return this.bivec.equals(other.bivec);
  }

  /**
   * Linearly interpolate between two directions
   * @param {Point} a The first point
   * @param {Point} b The second point
   * @param {number} t The interpolation factor
   */
  static lerp(a, b, t) {
    const bivector = Even.lerp(a.bivec, b.bivec, t);
    return Point.from_bivec(bivector);
  }

  /**
   * Generate the N n-th roots of unity, i.e. N evenly spaced points around
   * the unit circle exp(2 * pi * i * k / N), except expressed as
   * direction objects, not complex numbers.
   * @param {number} n A positive integer number of roots to generate
   * @return {Point[]} An array of the N roots
   */
  static roots_of_unity(n) {
    if (n < 1) {
      throw new Error("n must be a positive integer");
    }

    const roots = new Array(n);

    for (let i = 0; i < n; i++) {
      const angle = ((2 * Math.PI) / n) * i;
      roots[i] = Direction.from_angle(angle);
    }

    return roots;
  }
}
Direction.DIR_X = Object.freeze(new Direction(1, 0));
Direction.DIR_Y = Object.freeze(new Direction(0, 1));
Direction.ZERO = Object.freeze(new Direction(0, 0));
