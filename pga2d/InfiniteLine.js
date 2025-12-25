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
