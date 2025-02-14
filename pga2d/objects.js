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

  euclidean_norm_sqr() {
    // the xo and yo parts square to 0, so we only have xy * yx
    const { xy } = this.bivec;
    return xy * xy;
  }

  euclidean_norm() {
    return Math.sqrt(this.euclidean_norm_sqr());
  }

  ideal_norm_sqr() {
    // this is the euclidean norm of the dual, but computed without allocating
    // the dual line
    const { yo: x, xo: y } = this.bivec;
    return x * x + y * y;
  }

  ideal_norm() {
    return Math.sqrt(this.ideal_norm_sqr());
  }

  add(other) {
    const { xy, xo, yo } = this.bivec.add(other.bivec);
    return new Point(xy, xo, yo);
  }

  sub(other) {
    const { xy, xo, yo } = this.bivec.sub(other.bivec);
    return new Point(xy, xo, yo);
  }

  join(other) {
    const { x, y, o } = this.bivec.vee(other.bivec);
    return new Line(x, y, -o);
  }

  dist_sqr(point) {
    return this.sub(point).ideal_norm();
  }

  limit_length(max_length) {
    const curr_length = this.ideal_norm();
    const next_length = Math.min(curr_length, max_length);
    const scale_factor = next_length / curr_length;
    return this.scale(scale_factor);
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

  toString() {
    const x_str = this.x.toPrecision(3);
    const y_str = this.y.toPrecision(3);

    if (this.is_direction) {
      return `Direction(${x_str}, ${y_str})`;
    }

    return `Point(${x_str}, ${y_str})`;
  }

  equals(other) {
    return this.bivec.equals(other.bivec);
  }

  static lerp(a, b, t) {
    const { xy, xo, yo } = Even.lerp(a.bivec, b.bivec, t);
    return new Point(xy, xo, yo);
  }
}
Point.ORIGIN = Object.freeze(Point.point(0, 0));
Point.DIR_X = Object.freeze(Point.direction(1, 0));
Point.DIR_Y = Object.freeze(Point.direction(0, 1));
Point.ZERO = Object.freeze(new Point(0, 0, 0));

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

  meet(other) {
    const { xy, xo, yo } = this.vec.wedge(other.vec);
    return new Point(xy, xo, yo);
  }

  equals(other) {
    return this.vec.equals(other.vec);
  }
}
Line.X_AXIS = Object.freeze(new Line(0, 1, 0));
Line.Y_AXIS = Object.freeze(new Line(1, 0, 0));
