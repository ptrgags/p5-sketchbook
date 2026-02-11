import { is_nearly } from "../is_nearly.js";
import { CEven } from "./CEven.js";

export class COdd {
  /**
   * Constructor
   * @param {number} x
   * @param {number} y
   * @param {number} p
   * @param {number} m
   * @param {number} xyp
   * @param {number} xym
   * @param {number} xpm
   * @param {number} ypm
   */
  constructor(x, y, p, m, xyp, xym, xpm, ypm) {
    this.x = x;
    this.y = y;
    this.p = p;
    this.m = m;
    this.xyp = xyp;
    this.xym = xym;
    this.xpm = xpm;
    this.ypm = ypm;
  }

  /**
   * Compute the squared norm of the odd multivector
   * TODO: I need to check the math on this, as the dot product isn't
   * always a scalar in 4D+
   * @returns {number}
   */
  norm_sqr() {
    return (
      this.x * this.x +
      this.y * this.y +
      this.p * this.p -
      this.m * this.m +
      // TODO: Check these signs
      this.xyp * this.xyp -
      this.xym * this.xym -
      this.xpm * this.xpm -
      this.ypm * this.ypm
    );
  }

  /**
   * Get the magnitude of the multivector
   * @returns {number}
   */
  norm() {
    // TODO: not sure how to handle this for negative
    // multivectors. See what kindon does.
    const norm_sqr = this.norm_sqr();
    if (norm_sqr < 0) {
      throw new Error("taking norm of negative multivector");
    }
    return Math.sqrt(norm_sqr);
  }

  /**
   * Rescale the multivector so it has unit magnitude
   * @returns {COdd}
   */
  normalize() {
    const length = this.norm();
    if (is_nearly(length, 0)) {
      return this;
    }

    return new COdd(
      this.x / length,
      this.y / length,
      this.p / length,
      this.m / length,
      this.xyp / length,
      this.xym / length,
      this.xpm / length,
      this.ypm / length,
    );
  }

  /**
   * Negate all the coordinates of this multivector
   * @returns {COdd}
   */
  neg() {
    return new COdd(
      -this.x,
      -this.y,
      -this.p,
      -this.m,
      -this.xyp,
      -this.xym,
      -this.xpm,
      -this.ypm,
    );
  }

  /**
   * Add two odd multivectors
   * @param {COdd} other
   * @returns {COdd}
   */
  add(other) {
    const x = this.x + other.x;
    const y = this.y + other.y;
    const p = this.p + other.p;
    const m = this.m + other.m;
    const xyp = this.xyp + other.xyp;
    const xym = this.xym + other.xym;
    const xpm = this.xpm + other.xpm;
    const ypm = this.ypm + other.ypm;
    return new COdd(x, y, p, m, xyp, xym, xpm, ypm);
  }

  /**
   * Subtract two odd multivectors
   * @param {COdd} other
   * @returns {COdd}
   */
  sub(other) {
    const x = this.x - other.x;
    const y = this.y - other.y;
    const p = this.p - other.p;
    const m = this.m - other.m;
    const xyp = this.xyp - other.xyp;
    const xym = this.xym - other.xym;
    const xpm = this.xpm - other.xpm;
    const ypm = this.ypm - other.ypm;
    return new COdd(x, y, p, m, xyp, xym, xpm, ypm);
  }

  /**
   * Compute the Hoge Dual
   * @returns {COdd}
   */
  dual() {
    // this_blade ^ abs_dual(this_blade) = sign * xypm
    // dual(this_blade) = sign * abs_dual(this_blade)
    // x ^ ypm = xypm
    // y ^ xpm = -xypm
    // p ^ xym = xypm
    // m ^ xyp = -xypm
    // xyp ^ m = xypm
    // xym ^ p = -xypm
    // xpm ^ y = xypm
    // ypm ^ x = -xypm
    const x = -this.ypm;
    const y = this.xpm;
    const p = -this.xym;
    const m = this.xyp;
    const xyp = -this.m;
    const xym = this.p;
    const xpm = -this.y;
    const ypm = this.x;
    return new COdd(x, y, p, m, xyp, xym, xpm, ypm);
  }

  /**
   * Antidual, the inverse of dual. It's nearly the same
   * except for a few pesky sign flips
   * @returns {COdd}
   */
  antidual() {
    // abs_antidual(this_blade) ^ this_blade = sign * xypm
    // antidual(this_blade) = sign * abs_antidual(this_blade)
    // x ^ ypm = xypm
    // y ^ xpm = -xypm
    // p ^ xym = xypm
    // m ^ xyp = -xypm
    // xyp ^ m = xypm
    // xym ^ p = -xypm
    // xpm ^ y = xypm
    // ypm ^ x = -xypm
    // Huh, I see that in this case, odd.antidual() = odd.dual().neg()
    const x = this.ypm;
    const y = -this.xpm;
    const p = this.xym;
    const m = -this.xyp;
    const xyp = this.m;
    const xym = -this.p;
    const xpm = this.y;
    const ypm = -this.x;
    return new COdd(x, y, p, m, xyp, xym, xpm, ypm);
  }

  /**
   * The reverse operation takes each blade and reverses the
   * order of basis vectors in the wedge product.
   * This makes the trivector part reverse orientation
   * @returns {COdd}
   */
  reverse() {
    return new COdd(
      this.x,
      this.y,
      this.p,
      this.m,
      -this.xyp,
      -this.xym,
      -this.xpm,
      -this.ypm,
    );
  }

  /**
   * Check if two CEven objects are equal
   * @param {COdd} other
   */
  equals(other) {
    return (
      is_nearly(this.x, other.x) &&
      is_nearly(this.y, other.y) &&
      is_nearly(this.p, other.p) &&
      is_nearly(this.m, other.m) &&
      is_nearly(this.xyp, other.xyp) &&
      is_nearly(this.xym, other.xym) &&
      is_nearly(this.xpm, other.xpm) &&
      is_nearly(this.ypm, other.ypm)
    );
  }

  /**
   * Geometric product with an odd multivector
   * @param {COdd} odd
   * @returns {CEven}
   */
  gp_odd(odd) {
    const {
      x: Ax,
      y: Ay,
      p: Ap,
      m: Am,
      xyp: Axyp,
      xym: Axym,
      xpm: Axpm,
      ypm: Aypm,
    } = this;
    const {
      x: Bx,
      y: By,
      p: Bp,
      m: Bm,
      xyp: Bxyp,
      xym: Bxym,
      xpm: Bxpm,
      ypm: Bypm,
    } = odd;

    const scalar =
      -Am * Bm +
      Ap * Bp +
      Ax * Bx +
      Axpm * Bxpm +
      Axym * Bxym -
      Axyp * Bxyp +
      Ay * By +
      Aypm * Bypm;
    const xy =
      -Am * Bxym +
      Ap * Bxyp +
      Ax * By +
      Axpm * Bypm -
      Axym * Bm +
      Axyp * Bp -
      Ay * Bx -
      Aypm * Bxpm;
    const xp =
      -Am * Bxpm -
      Ap * Bx +
      Ax * Bp -
      Axpm * Bm -
      Axym * Bypm -
      Axyp * By -
      Ay * Bxyp +
      Aypm * Bxym;
    const xm =
      -Am * Bx -
      Ap * Bxpm +
      Ax * Bm -
      Axpm * Bp -
      Axym * By -
      Axyp * Bypm -
      Ay * Bxym +
      Aypm * Bxyp;
    const yp =
      -Am * Bypm -
      Ap * By +
      Ax * Bxyp -
      Axpm * Bxym +
      Axym * Bxpm +
      Axyp * Bx +
      Ay * Bp -
      Aypm * Bm;
    const ym =
      -Am * By -
      Ap * Bypm +
      Ax * Bxym -
      Axpm * Bxyp +
      Axym * Bx +
      Axyp * Bxpm +
      Ay * Bm -
      Aypm * Bp;
    const pm =
      -Am * Bp +
      Ap * Bm +
      Ax * Bxpm +
      Axpm * Bx +
      Axym * Bxyp -
      Axyp * Bxym +
      Ay * Bypm +
      Aypm * By;
    const xypm =
      -Am * Bxyp +
      Ap * Bxym +
      Ax * Bypm +
      Axpm * By -
      Axym * Bp +
      Axyp * Bm -
      Ay * Bxpm -
      Aypm * Bx;
    return new CEven(scalar, xy, xp, xm, yp, ym, pm, xypm);
  }

  /**
   * Geometric product with an even multivector
   * @param {CEven} even
   * @returns {COdd}
   */
  gp_even(even) {
    const {
      x: Ax,
      y: Ay,
      p: Ap,
      m: Am,
      xyp: Axyp,
      xym: Axym,
      xpm: Axpm,
      ypm: Aypm,
    } = this;
    const {
      scalar: Bs,
      xy: Bxy,
      xp: Bxp,
      xm: Bxm,
      yp: Byp,
      ym: Bym,
      pm: Bpm,
      xypm: Bxypm,
    } = even;
    const x =
      Am * Bxm -
      Ap * Bxp +
      Ax * Bs +
      Axpm * Bpm +
      Axym * Bym -
      Axyp * Byp -
      Ay * Bxy -
      Aypm * Bxypm;
    const y =
      Am * Bym -
      Ap * Byp +
      Ax * Bxy +
      Axpm * Bxypm -
      Axym * Bxm +
      Axyp * Bxp +
      Ay * Bs +
      Aypm * Bpm;
    const p =
      Am * Bpm +
      Ap * Bs +
      Ax * Bxp -
      Axpm * Bxm -
      Axym * Bxypm -
      Axyp * Bxy +
      Ay * Byp -
      Aypm * Bym;
    const m =
      Am * Bs +
      Ap * Bpm +
      Ax * Bxm -
      Axpm * Bxp -
      Axym * Bxy -
      Axyp * Bxypm +
      Ay * Bym -
      Aypm * Byp;
    const xyp =
      Am * Bxypm +
      Ap * Bxy +
      Ax * Byp -
      Axpm * Bym +
      Axym * Bpm +
      Axyp * Bs -
      Ay * Bxp +
      Aypm * Bxm;
    const xym =
      Am * Bxy +
      Ap * Bxypm +
      Ax * Bym -
      Axpm * Byp +
      Axym * Bs +
      Axyp * Bpm -
      Ay * Bxm +
      Aypm * Bxp;
    const xpm =
      Am * Bxp -
      Ap * Bxm +
      Ax * Bpm +
      Axpm * Bs +
      Axym * Byp -
      Axyp * Bym -
      Ay * Bxypm -
      Aypm * Bxy;
    const ypm =
      Am * Byp -
      Ap * Bym +
      Ax * Bxypm +
      Axpm * Bxy -
      Axym * Bxp +
      Axyp * Bxm +
      Ay * Bpm +
      Aypm * Bs;
    return new COdd(x, y, p, m, xyp, xym, xpm, ypm);
  }

  /**
   * Geometric Product
   * @param {COdd | CEven} other
   * @returns {COdd | CEven}
   */
  gp(other) {
    if (other instanceof COdd) {
      return this.gp_odd(other);
    }

    return this.gp_even(other);
  }

  /**
   * Unit sandwich for odd multivectors
   * @param {COdd} odd
   * @returns {COdd}
   */
  unit_sandwich_odd(odd) {
    // Note: For odd sandwich odd, we need to negate the result.
    return this.gp_odd(odd).gp_odd(this.reverse()).neg();
  }

  /**
   * Unit sandwich for even multivectors
   * @param {CEven} even
   * @returns {CEven}
   */
  unit_sandwich_even(even) {
    return this.gp_even(even).gp_odd(this.reverse());
  }

  /**
   * Compute the sandwich product ABA^(-1), but only
   * where A is of magnitude +1, so this can be computed
   * more efficiently as A * B * A.reverse()
   * @param {CEven | COdd} other
   * @returns {CEven | COdd}
   */
  unit_sandwich(other) {
    if (other instanceof COdd) {
      return this.unit_sandwich_odd(other);
    }
    return this.gp(other).gp(this.reverse());
  }

  /**
   * Linearly interpolate two odd multivectors
   * @param {COdd} a First multivector
   * @param {COdd} b Second multivector
   * @param {number} t interpolation factor
   * @returns {COdd} Interpolated value
   */
  static lerp(a, b, t) {
    const s = 1 - t;

    const x = s * a.x + t * b.x;
    const y = s * a.y + t * b.y;
    const p = s * a.p + t * b.p;
    const m = s * a.m + t * b.m;
    const xyp = s * a.xyp + t * b.xyp;
    const xym = s * a.xym + t * b.xym;
    const xpm = s * a.xpm + t * b.xpm;
    const ypm = s * a.ypm + t * b.ypm;
    return new COdd(x, y, p, m, xyp, xym, xpm, ypm);
  }
}
COdd.ZERO = Object.freeze(new COdd(0, 0, 0, 0, 0, 0, 0, 0));
