import { Even, Odd } from "./multivectors.js";
import { is_nearly } from "../sketchlib/is_nearly.js";

export class Point {
  constructor(x, y) {
    // a euclidean point is represented in 2D PGA as a bivector
    // normalized so xy = 1, i.e.
    // a*yo - b*xo + xy
    // here a is the x-component and b is the y-component. Note the negative
    // sign, this is due to storing the blades in lexicographic order
    this.bivec = new Even(0, 1, -y, x);
  }

  get x() {
    return this.bivec.yo;
  }

  get y() {
    return -this.bivec.xo;
  }

  add(direction) {
    const { xo, yo } = this.bivec.add(direction.bivec);
    return new Point(yo, -xo);
  }

  sub(point) {
    const { xo, yo } = this.bivec.sub(point.bivec);
    return new Direction(yo, -xo);
  }

  dist_sqr(point) {
    return this.sub(point).norm();
  }

  equals(other) {
    return this.bivec.equals(other.bivec);
  }
}
Point.ORIGIN = Object.freeze(new Point(0, 0));

export class Direction {
  constructor(x, y) {
    // A direction (ideal point) is represented in 2D PGA as a bivector
    // with xy = 0. These are null vectors so can't be normalized.
    //
    // a * yo - b * xo
    this.bivec = new Even(0, 0, -y, x);
  }

  get x() {
    return this.bivec.yo;
  }

  get y() {
    return -this.bivec.xo;
  }

  dual() {
    const { x: nx, y: ny } = this.bivec.dual();
    return new Line(nx, ny, 0);
  }

  neg() {
    return new Direction(-this.x, -this.y);
  }

  norm() {
    const { yo: x, xo: y } = this.bivec;
    return x * x + y * y;
  }

  magnitude() {
    const mag_sqr = this.norm();
    if (mag_sqr === 0) {
      return 0;
    }
    return Math.sqrt(mag_sqr);
  }

  scale(scalar) {
    return new Direction(scalar * this.x, scalar * this.y);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  equals(other) {
    return this.bivec.equals(other.bivec);
  }
}
Direction.X = Object.freeze(new Direction(1, 0));
Direction.Y = Object.freeze(new Direction(0, 1));

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
