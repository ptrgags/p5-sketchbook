import { Even, Odd } from "./multivectors.js";
import { is_nearly } from "../sketchlib/is_nearly.js";

export class Point {
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

  static point(x, y) {
    return new Point(1, -y, x);
  }

  static direction(x, y) {
    return new Point(0, -y, x);
  }

  get x() {
    return this.bivec.yo;
  }

  get y() {
    return -this.bivec.xo;
  }

  dual() {
    const { x: nx, y: ny, o: d } = this.bivec.dual();
    return new Line(nx, ny, d);
  }

  neg() {
    if (this.is_direction) {
      return Point.direction(-this.x, -this.y);
    } else {
      // Negating a point results in -xo, -yo -xy which is equivalent to
      // xo, yo, xy by homogeneity.
      return this;
    }
  }

  euclidean_norm() {
    // the xo and yo parts square to 0, so we only have xy * yx
    const { xy } = this.bivec;
    return xy * xy;
  }

  euclidean_mag() {
    return Math.sqrt(this.euclidean_norm());
  }

  ideal_norm() {
    // this is the euclidean norm of the dual, but computed without allocating
    // the dual line
    const { yo: x, xo: y } = this.bivec;
    return x * x + y * y;
  }

  ideal_mag() {
    return Math.sqrt(this.ideal_norm());
  }

  add(other) {
    const { xy, xo, yo } = this.bivec.add(other.bivec);
    return new Point(xy, xo, yo);
  }

  sub(other) {
    const { xy, xo, yo } = this.bivec.sub(other.bivec);
    return new Point(xy, xo, yo);
  }

  dist_sqr(point) {
    return this.sub(point).ideal_norm();
  }

  scale(scalar) {
    if (this.is_direction) {
      return Point.direction(scalar * this.x, scalar * this.y);
    }

    // A point is invariant to scaling due to homogeneity
    return this;
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  equals(other) {
    return this.bivec.equals(other.bivec);
  }
}
Point.ORIGIN = Object.freeze(Point.point(0, 0));
Point.DIR_X = Object.freeze(Point.direction(1, 0));
Point.DIR_Y = Object.freeze(Point.direction(0, 1));

export class Line {
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

  get nx() {
    return this.vec.x;
  }

  get ny() {
    return this.vec.y;
  }

  get d() {
    return -this.vec.o;
  }

  equals(other) {
    return this.vec.equals(other.vec);
  }
}
