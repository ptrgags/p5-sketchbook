/**
 * A set of static functions that perform vector addition/scalar multiplication
 * for some arbitrary type. For my purposes, the field is assumed to be number
 * @template V The vector type
 * @typedef {Object} VectorSpace
 * @property {function(V, V): V} add
 * @property {function(number, V): V} scale
 */

// ugh this will be a hard class to type...
export class DirectSum {
  constructor(vector_spaces) {
    this.vector_spaces = vector_spaces;
  }

  add(a, b) {
    this.vector_spaces.map((v, i) => {
      return v.add(a[i], b[i]);
    });
  }

  scale(s, x) {
    this.vector_spaces.map((v, i) => {
      return v.scale(s, x[i]);
    });
  }
}

/**
 * Particle in the phase space sense of (position, velocity)
 * @template T
 */
export class PhasePoint {
  /**
   * Constructor
   * @param {T} position The location of the particle
   * @param {T} velocity The the velocity of the particle
   */
  constructor(position, velocity) {
    this.position = position;
    this.velocity = velocity;
  }
}

/**
 * @template T
 */
export class PhaseSpace {
  /**
   *
   * @param {import("../sketchlib/VectorSpace").VectorSpace<T>} space The underlying vector space to use for both position and velocity
   */
  constructor(space) {
    this.space = space;
  }

  /**
   * Vector addition
   * @param {PhasePoint<T>} a The first point
   * @param {PhasePoint<T>} b The second point
   * @returns T the sum
   */
  add(a, b) {
    return new PhasePoint(
      this.space.add(a.position, b.position),
      this.space.add(a.velocity, b.velocity)
    );
  }

  /**
   * Scalar multiplication
   * @param {number} s The scalar
   * @param {PhasePoint<T>} x The second point
   * @returns The scaled phase point
   */
  scale(s, x) {
    return new PhasePoint(
      this.space.scale(s, x.position),
      this.space.scale(s, x.velocity)
    );
  }
}

/**
 * For Runge-Kutta simulations, the vector space is a tuple of
 * coordinates (position1, velocity1, position2, velocity2, etc.) packed
 * into a number[] so we can map addition over it all at once.
 */
export class GeneralizedCoordinates {
  /**
   *
   * @param {number[]} a The first vector
   * @param {number[]} b The second vector
   * @returns {number[]} The sum
   */
  static add(a, b) {
    return a.map((x, i) => x + b[i]);
  }

  /**
   *
   * @param {number} s The scalar
   * @param {number[]} v The second scalar
   * @returns {number[]} The scaled vector
   */
  static scale(s, v) {
    return v.map((x) => x * s);
  }
}
