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

  static lerp(a, b, t) {
    const { xo, yo } = Even.lerp(a.bivec, b.bivec, t);
    return new Point(yo, -xo);
  }
}

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

  norm() {
    const { yo: x, xo: y } = this.bivec;
    return x * x + y * y;
  }

  scale(scalar) {
    return new Direction(scalar * this.x, scalar * this.y);
  }
}
