import { is_nearly } from "../is_nearly.js";
import { Primitive } from "../primitives/Primitive.js";
import { Direction } from "./Direction.js";
import { Odd } from "./multivectors.js";
import { Point } from "./Point.js";

/**
 * a line in PGA is represented by a unit normal and distance from origin
 *
 * @implements {Primitive}
 */
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
   * @returns {Point | Direction}
   */
  meet(other) {
    const bivec = this.vec.wedge_odd(other.vec);
    if (is_nearly(bivec.xy, 0)) {
      return Direction.from_bivec(bivec);
    }

    return Point.from_bivec(bivec);
  }

  /**
   * Get the dot product of lines - the cosine of the angle between them
   * @param {Line} other Another line
   * @returns {number} The dot product of the lines.
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

  /**
   * Draw the line as a line segment that goes past the canvas bounds
   * @param {import('p5')} p p5 library
   */
  draw(p) {
    const { nx, ny, d } = this;

    // The line will be as long as half the perimeter of the canvas
    // we want half of that here.
    const RADIUS = 600;

    // Center point is in the direction n a distance d
    const cx = d * nx;
    const cy = d * ny;
    // rotate the normal to get a tangent
    // via (x, y) -> (-y, x)
    const tx = -ny;
    const ty = nx;

    // the points are
    // center +/- radius * tangent
    const x1 = cx + RADIUS * tx;
    const y1 = cy + RADIUS * ty;
    const x2 = cx - RADIUS * tx;
    const y2 = cy - RADIUS * ty;
    p.line(x1, y1, x2, y2);
  }
}
Line.X_AXIS = Object.freeze(new Line(0, 1, 0));
Line.Y_AXIS = Object.freeze(new Line(1, 0, 0));
