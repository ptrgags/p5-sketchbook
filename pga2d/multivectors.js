import { is_nearly } from "../sketchlib/is_nearly.js";

// Much of the math here is determined by using the geometric algebra library
// kingdon. See my other repo math-notebook in symbolic/gaproduct.py.
// At the time of this writing
// this is in the cga branch
export class Even {
  constructor(scalar, xy, xo, yo) {
    this.scalar = scalar;
    this.xy = xy;
    this.xo = xo;
    this.yo = yo;
  }

  add(other) {
    const scalar = this.scalar + other.scalar;
    const xy = this.xy + other.xy;
    const xo = this.xo + other.xo;
    const yo = this.yo + other.yo;
    return new Even(scalar, xy, xo, yo);
  }

  sub(other) {
    const scalar = this.scalar - other.scalar;
    const xy = this.xy - other.xy;
    const xo = this.xo - other.xo;
    const yo = this.yo - other.yo;
    return new Even(scalar, xy, xo, yo);
  }

  dual() {
    return new Odd(this.yo, -this.xo, this.xy, this.scalar);
  }

  // in 2D PGA, the antidual has exactly the same signs as the dual
  // so we get this function for free!
  antidual = this.dual;

  reverse() {
    return new Even(this.scalar, -this.xy, -this.xo, -this.yo);
  }

  vee_even(other) {
    // Bread V = A + Bxy + Cxo + Dyo
    const { xy: axy, xo: axo, yo: ayo } = this;
    // Filling U = a + bxy + cxo + dyo
    const { xy: bxy, xo: bxo, yo: byo } = other;

    const x = -axo * bxy + axy * bxo;
    const y = -ayo * bxy + axy * byo;
    const o = axo * byo - ayo * bxo;
    // Since the regressive product reduces grade, we will never get the
    // pseudoscalar
    return new Odd(x, y, o, 0);
  }

  vee_odd(other) {
    throw new Error("Not implemented");
  }

  vee(other) {
    if (other instanceof Even) {
      return this.vee_even(other);
    }

    return this.vee_odd(other);
  }

  equals(other) {
    return (
      is_nearly(this.scalar, other.scalar) &&
      is_nearly(this.xy, other.xy) &&
      is_nearly(this.xo, other.xo) &&
      is_nearly(this.yo, other.yo)
    );
  }

  sandwich_even(other) {
    // Bread V = A + Bxy + Cxo + Dyo
    const { scalar: as, xy: axy, xo: axo, yo: ayo } = this;
    // Filling U = a + bxy + cxo + dyo
    const { scalar: bs, xy: bxy, xo: bxo, yo: byo } = other;

    const mag_sqr = as * as + axy * axy;
    if (is_nearly(mag_sqr, 0)) {
      return Even.ZERO;
    }

    const scalar = bs;
    const xy = bxy;
    const xo =
      -(
        -2 * axo * axy * bxy +
        2 * ayo * as * bxy +
        -as * as * bxo +
        -2 * as * axy * byo +
        axy * axy * bxo
      ) / mag_sqr;
    const yo =
      -(
        -2 * axo * as * bxy +
        -2 * ayo * axy * bxy +
        -as * as * byo +
        2 * as * axy * bxo +
        axy * axy * byo
      ) / mag_sqr;
    return new Even(scalar, xy, xo, yo);
  }

  sandwich_odd(other) {
    const { scalar: as, xy: axy, xo: axo, yo: ayo } = this;
    const { x: bx, y: by, o: bo, xyo: bxyo } = other;

    const mag_sqr = as * as + axy * axy;
    if (is_nearly(mag_sqr, 0)) {
      return Odd.ZERO;
    }

    const x = (as * as * bx + 2 * as * axy * by - axy * axy * bx) / mag_sqr;
    const y = (as * as * by - 2 * as * axy * bx - axy * axy * by) / mag_sqr;
    const o =
      (-2 * axo * as * bx +
        -2 * axo * axy * by +
        -2 * ayo * as * by +
        2 * ayo * axy * bx +
        as * as * bo +
        axy * axy * bo) /
      mag_sqr;
    const xyo = bxyo;

    return new Odd(x, y, o, xyo);
  }

  sandwich(other) {
    if (other instanceof Odd) {
      return this.sandwich_odd(other);
    }

    return this.sandwich_even(other);
  }

  static lerp(a, b, t) {
    const s = 1 - t;

    const scalar = s * a.scalar + t * b.scalar;
    const xy = s * a.xy + t * b.xy;
    const xo = s * a.xo + t * b.xo;
    const yo = s * a.yo + t * b.yo;

    return new Even(scalar, xy, xo, yo);
  }

  toString() {
    return `${this.scalar.toPrecision(2)} + ${this.xy.toPrecision(
      2
    )}xy + ${this.xo.toPrecision(2)}xo + ${this.yo.toPrecision(2)}`;
  }
}
Even.ZERO = Object.freeze(new Even(0, 0, 0, 0));
Even.IDENTITY = Object.freeze(new Even(1, 0, 0, 0));

export class Odd {
  constructor(x, y, o, xyo) {
    this.x = x;
    this.y = y;
    this.o = o;
    this.xyo = xyo;
  }

  norm_sqr() {
    return this.x * this.x + this.y * this.y;
  }

  norm() {
    return Math.sqrt(this.norm_sqr());
  }

  scale(scalar) {
    return new Odd(
      this.x * scalar,
      this.y * scalar,
      this.o * scalar,
      this.xyo * scalar
    );
  }

  normalize() {
    const length = this.norm();
    if (is_nearly(length, 0)) {
      return this;
    }

    return new Odd(
      this.x / length,
      this.y / length,
      this.o / length,
      this.xyo / length
    );
  }

  neg() {
    return new Odd(-this.x, -this.y, -this.o, -this.xyo);
  }

  add(other) {
    const x = this.x + other.x;
    const y = this.y + other.y;
    const o = this.o + other.o;
    const xyo = this.xyo + other.xyo;
    return new Odd(x, y, o, xyo);
  }

  sub(other) {
    const x = this.x - other.x;
    const y = this.y - other.y;
    const o = this.o - other.o;
    const xyo = this.xyo - other.xyo;
    return new Odd(x, y, o, xyo);
  }

  dual() {
    return new Even(this.xyo, this.o, -this.y, this.x);
  }

  antidual = this.dual;

  dot(other) {
    // The o and xyo components square to zero, so they are needed
    const { x: ax, y: ay } = this;
    const { x: bx, y: by } = other;

    return ax * bx + ay * by;
  }

  wedge_odd(other) {
    // Note that the pseudoscalar part xyo will always wedge to 0, so we can
    // ignore it.
    const { x: ax, y: ay, o: ao } = this;
    const { x: bx, y: by, o: bo } = other;

    const xy_part = ax * by - ay * bx;
    const xo_part = ax * bo - ao * bx;
    const yo_part = ay * bo - ao * by;

    return new Even(0, xy_part, xo_part, yo_part);
  }

  wedge_even(other) {
    throw new Error("Not Implemented");
  }

  wedge(other) {
    if (other instanceof Odd) {
      return this.wedge_odd(other);
    }

    return this.wedge_even(other);
  }

  sandwich_even(other) {
    const { x: ax, y: ay, o: ao, xyo: axyo } = this;
    const { scalar: bs, xy: bxy, xo: bxo, yo: byo } = other;

    // if the bread is a null vector, the result will be zero
    const mag_sqr = ax * ax + ay * ay;
    if (is_nearly(mag_sqr, 0)) {
      return Even.ZERO;
    }

    const scalar = bs;
    const xy = -bxy;
    const xo =
      -(
        2 * ao * ay * bxy +
        -2 * axyo * ax * bxy +
        ax * ax * bxo +
        2 * ax * ay * byo +
        -ay * ay * bxo
      ) / mag_sqr;
    const yo =
      -(
        -2 * ao * ax * bxy +
        -2 * axyo * ay * bxy +
        -ax * ax * byo +
        2 * ax * ay * bxo +
        ay * ay * byo
      ) / mag_sqr;

    return new Even(scalar, xy, xo, yo);
  }

  sandwich_odd(other) {
    const { x: ax, y: ay, o: ao, xyo: axyo } = this;
    const { x: bx, y: by, o: bo, xyo: bxyo } = other;

    const mag_sqr = ax * ax + ay * ay;
    if (is_nearly(mag_sqr, 0)) {
      return Odd.ZERO;
    }

    const x = (ax * ax * bx + 2 * ax * ay * by - ay * ay * bx) / mag_sqr;
    const y = (-ax * ax * by + 2 * ax * ay * bx + ay * ay * by) / mag_sqr;
    const o =
      (2 * ao * ax * bx +
        2 * ao * ay * by +
        2 * axyo * ax * by +
        -2 * axyo * ay * bx +
        -ax * ax * bo +
        -ay * ay * bo) /
      mag_sqr;
    const xyo = bxyo;

    // Note: for odd[odd], we need to negate the result. The other 3
    // sandwich products have a positive sign.
    return new Odd(-x, -y, -o, -xyo);
  }

  sandwich(other) {
    if (other instanceof Odd) {
      return this.sandwich_odd(other);
    }

    return this.sandwich_even(other);
  }

  equals(other) {
    return (
      is_nearly(this.x, other.x) &&
      is_nearly(this.y, other.y) &&
      is_nearly(this.o, other.o) &&
      is_nearly(this.xyo, other.xyo)
    );
  }

  toString() {
    return `${this.x.toPrecision(2)}x + ${this.y.toPrecision(
      2
    )}y + ${this.o.toPrecision(2)}o + ${this.xyo.toPrecision(2)}xyo`;
  }
}
Odd.ZERO = Object.freeze(new Odd(0, 0, 0, 0));
