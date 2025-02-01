import { Even } from "./multivectors.js";

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
}
Direction.X = Object.freeze(new Direction(1, 0));
Direction.Y = Object.freeze(new Direction(0, 1));
