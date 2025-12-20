import { Even, Odd } from "./multivectors.js";
import { is_nearly } from "../sketchlib/is_nearly.js";

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
   * Constructor. This is mainly for internal use, see Point and
   * Point.direction instead
   * @param {number} xy The xy component (0 for directions, nonzero for points)
   * @param {number} xo The xo component (the *flipped* vertical direction)
   * @param {number} yo The yo component (the horizontal direction)
   */
  constructor(xy, xo, yo) {
    if (xy === undefined) {
      throw new Error("fix me!");
    }

    this.is_direction = is_nearly(xy, 0);

    if (this.is_direction) {
      this.bivec = new Even(0, 0, xo, yo);
    } else {
      this.bivec = new Even(0, 1, xo / xy, yo / xy);
    }
  }

  /**
   * Create a Euclidean point, i.e. the xy component is 1
   * @param {number} x The x coordinate
   * @param {number} y The y coordinate
   * @returns {Point} the constructed Point object
   */
  static point(x, y) {
    return new Point(1, -y, x);
  }

  /**
   * Create an ideal point, i.e. the xy component is 0. This represents a
   * point at infinity in the given direction
   * @param {number} x The x direction
   * @param {number} y The y direction
   * @returns {Point} the constructed direction as a Point object
   */
  static direction(x, y) {
    return new Point(0, -y, x);
  }

  /**
   * Get a direction from an angle
   * @param {number} theta Counterclockwise angle in radians
   * @returns {Point} A direction with the coordinates (cos(theta), sin(theta))
   */
  static dir_from_angle(theta) {
    return Point.direction(Math.cos(theta), Math.sin(theta));
  }

  /**
   * Construct from a bivector
   * @param {Even} bivec The bivector that represents this point.
   */
  static from_bivec(bivec) {
    const { xy, xo, yo } = bivec;
    return new Point(xy, xo, yo);
  }

  to_direction() {
    return Point.direction(this.x, this.y);
  }

  to_point() {
    return Point.point(this.x, this.y);
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
   * @returns {Point} The direction to negate
   */
  neg() {
    if (this.is_direction) {
      return Point.direction(-this.x, -this.y);
    } else {
      // Negating a point results in -xo, -yo -xy which is equivalent to
      // xo, yo, xy by homogeneity.
      return this;
    }
  }

  /**
   * Get the euclidean norm squared. This is confusingly the xy-component squared
   * @returns {number} The squared euclidean norm
   */
  euclidean_norm_sqr() {
    // the xo and yo parts square to 0, so we only have xy * yx
    const { xy } = this.bivec;
    return xy * xy;
  }

  /**
   * Get the euclidean norm. This is confusingly the absolute value of the xy-component
   * @returns {number} The euclidean norm
   */
  euclidean_norm() {
    // this is equivalent to sqrt(euclidean_norm_sqr), since abs(x) = sqrt(x^2)
    const { xy } = this.bivec;
    return Math.abs(xy);
  }

  /**
   * The ideal norm squared. Confusingly, this is the usual norm x^2 + y^2 in GA
   * @returns {number} The ideal norm squared
   */
  ideal_norm_sqr() {
    // this is the euclidean norm of the dual, but computed without allocating
    // the dual line
    const { yo: x, xo: y } = this.bivec;
    return x * x + y * y;
  }

  /**
   * The ideal norm, sqrt(x^2 + y^2)
   * @returns {number} The ideal norm squared
   */
  ideal_norm() {
    return Math.sqrt(this.ideal_norm_sqr());
  }

  /**
   * Normalize the point (if possible) by dividing by the norm
   * @returns {Point} The point with unit length, or the original point for points with 0 norm
   */
  normalize() {
    if (!this.is_direction) {
      throw new Error("Normalize only makes sense for directions");
    }

    const { x, y } = this;
    const length = this.ideal_norm();
    if (is_nearly(length, 0)) {
      return this;
    }

    return Point.direction(x / length, y / length);
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
    if (!this.is_direction) {
      return this;
    }

    const curr_length = this.ideal_norm();
    if (curr_length === 0) {
      return this;
    }

    const next_length = Math.min(curr_length, max_length);
    const scale_factor = next_length / curr_length;
    return this.scale(scale_factor);
  }

  /**
   * Uniformly scale the point. This only makes sense for directions, as
   * points are homogeneous
   * @param {number} scalar The scale factor
   * @returns {Point} the result of scaling
   */
  scale(scalar) {
    if (this.is_direction) {
      return Point.direction(scalar * this.x, scalar * this.y);
    }

    return this;
  }

  /**
   * Return a point of the same type
   * @param {Point} point The original point
   * @returns {Point} The result of flipping the y-coordinate
   */
  flip_y() {
    if (this.is_direction) {
      return Point.direction(this.x, -this.y);
    }

    return Point.point(this.x, -this.y);
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

    if (this.is_direction) {
      return `Direction(${x_str}, ${y_str})`;
    }

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
      roots[i] = Point.dir_from_angle(angle);
    }

    return roots;
  }
}
Point.ORIGIN = Object.freeze(Point.point(0, 0));
Point.DIR_X = Object.freeze(Point.direction(1, 0));
Point.DIR_Y = Object.freeze(Point.direction(0, 1));
Point.ZERO = Object.freeze(new Point(0, 0, 0));

export class Line {
  /**
   * @param {number} nx The x-component of the normal
   * @param {number} ny The y-component of the normal
   * @param {number} d The distance of the line from the origin in the direction of the normal with units of the normal's length
   */
  constructor(nx, ny, d) {
    const mag_sqr = nx * nx + ny * ny;

    this.is_infinite = is_nearly(mag_sqr, 0);

    if (this.is_infinite) {
      this.vec = new Odd(0, 0, -d, 0);
    } else {
      const mag = Math.sqrt(mag_sqr);
      this.vec = new Odd(nx / mag, ny / mag, -d / mag, 0);
    }
  }

  /**
   * Create a line from a vector object
   * @param {Odd} vec
   */
  static from_vec(vec) {
    const { x: nx, y: ny, o: d } = vec;
    return new Line(nx, ny, -d);
  }

  /**
   * The x component of the normal
   * @type {number}
   */
  get nx() {
    return this.vec.x;
  }

  /**
   * The y-component of the normal
   * @type {number}
   */
  get ny() {
    return this.vec.y;
  }

  /**
   * The distance from the origin in the direction of the normal
   * @type {number}
   */
  get d() {
    return -this.vec.o;
  }

  /**
   * Find the meet of two lines. This is their point of intersection, or for parallel lines
   * an ideal point in the direction the lines point (this is 90 degrees clockwise of their normals)
   * @param {Line} other The line to intersect with
   */
  meet(other) {
    const bivec = this.vec.wedge_odd(other.vec);
    return Point.from_bivec(bivec);
  }

  /**
   *
   * @param {Line} other
   * @returns {number} The dot product of the lines. This is the cosine of the line betwen them.
   */
  dot(other) {
    return this.vec.dot(other.vec);
  }

  /**
   * Get the sin of the angle between two lines without using trig functions. This is
   * the magnitude of the wedge product
   * @param {Line} other The other line
   * @returns {number} Sine of the angle between the two lines
   */
  sin_angle_to(other) {
    return this.vec.wedge_odd(other.vec).xy;
  }

  /**
   * Check if this line is equivalent to another. This uses is_nearly()
   * due to floating point calculations
   * @param {Line} other Another line
   * @returns {boolean} true if the lines are equivalent (up to epsilon)
   */
  equals(other) {
    return this.vec.equals(other.vec);
  }

  toString() {
    if (this.is_infinite) {
      return `LineAtInfinity(${this.vec.o})`;
    }

    return `Line(${this.nx}, ${this.ny}, ${this.d})`;
  }
}
Line.X_AXIS = Object.freeze(new Line(0, 1, 0));
Line.Y_AXIS = Object.freeze(new Line(1, 0, 0));
