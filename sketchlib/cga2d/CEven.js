import { is_nearly } from "../is_nearly.js";
import { COdd } from "./COdd.js";

export class CEven {
  /**
   * Constructor
   * @param {number} scalar
   * @param {number} xy
   * @param {number} xp
   * @param {number} xm
   * @param {number} yp
   * @param {number} ym
   * @param {number} pm
   * @param {number} xypm
   */
  constructor(scalar, xy, xp, xm, yp, ym, pm, xypm) {
    this.scalar = scalar;
    this.xy = xy;
    this.xp = xp;
    this.xm = xm;
    this.yp = yp;
    this.ym = ym;
    this.pm = pm;
    this.xypm = xypm;
  }

  /**
   * Compute the squared norm of the multivector
   * TODO: I need to check the math on this, as the dot product isn't
   * always a scalar in 4D+
   * @returns {number}
   */
  norm_sqr() {
    return (
      this.xy * this.xy +
      this.xp * this.xp +
      this.xm * this.xm +
      this.yp * this.yp -
      this.ym * this.ym -
      this.pm * this.pm -
      this.xypm * this.xypm
    );
  }

  /**
   * Get the magnitude of the multivector
   * @returns {number}
   */
  norm() {
    const norm_sqr = this.norm_sqr();
    if (norm_sqr < 0) {
      throw new Error("taking norm of negative multivector");
    }

    return Math.sqrt(norm_sqr);
  }

  /**
   * Rescale the multivector so it has unit magnitude
   * @returns {CEven}
   */
  normalize() {
    const length = this.norm();
    if (is_nearly(length, 0)) {
      return this;
    }

    return new CEven(
      this.scalar / length,
      this.xy / length,
      this.xp / length,
      this.xm / length,
      this.yp / length,
      this.ym / length,
      this.pm / length,
      this.xypm / length,
    );
  }

  /**
   * Negate all the coordinates of this multivector
   * @returns {CEven}
   */
  neg() {
    return new CEven(
      -this.scalar,
      -this.xy,
      -this.xp,
      -this.xm,
      -this.yp,
      -this.ym,
      -this.pm,
      -this.xypm,
    );
  }

  /**
   * Add two even multivectors together
   * @param {CEven} other
   * @returns {CEven}
   */
  add(other) {
    const scalar = this.scalar + other.scalar;
    const xy = this.xy + other.xy;
    const xp = this.xp + other.xp;
    const xm = this.xm + other.xm;
    const yp = this.yp + other.yp;
    const ym = this.ym + other.ym;
    const pm = this.pm + other.pm;
    const xypm = this.xypm + other.xypm;

    return new CEven(scalar, xy, xp, xm, yp, ym, pm, xypm);
  }

  /**
   * Subtract two even multivectors
   * @param {CEven} other
   * @returns {CEven}
   */
  sub(other) {
    const scalar = this.scalar - other.scalar;
    const xy = this.xy - other.xy;
    const xp = this.xp - other.xp;
    const xm = this.xm - other.xm;
    const yp = this.yp - other.yp;
    const ym = this.ym - other.ym;
    const pm = this.pm - other.pm;
    const xypm = this.xypm - other.xypm;

    return new CEven(scalar, xy, xp, xm, yp, ym, pm, xypm);
  }

  /**
   * Compute the Hodge dual
   * @returns {CEven}
   */
  dual() {
    // this_blade ^ abs_dual(this_blade) = sign * xypm
    // dual(this_blade) = sign * abs_dual(this_blade)
    // 1 ^ xypm = xypm
    // xy ^ pm = xypm
    // xp ^ ym = -xypm
    // xm ^ yp = xypm
    // yp ^ xm = xypm
    // ym ^ xp = -xypm
    // pm ^ xy = xypm
    // xypm ^ 1 = xypm
    const scalar = this.xypm;
    const xy = this.pm;
    const xp = -this.ym;
    const xm = this.yp;
    const yp = this.xm;
    const ym = -this.xp;
    const pm = this.xy;
    const xypm = this.scalar;
    return new CEven(scalar, xy, xp, xm, yp, ym, pm, xypm);
  }

  /**
   * in 2D CGA, the anti (hodge) dual of an even multivector
   * has the same signs as the dual, so we get this for free!
   * @returns {CEven}
   */
  antidual = this.dual;

  /**
   * The reverse operation takes each blade and reverses the
   * order of basis vectors. This makes the bivector part
   * reverse orientation
   * @returns {CEven}
   */
  reverse() {
    return new CEven(
      this.scalar,
      -this.xy,
      -this.xp,
      -this.xm,
      -this.yp,
      -this.ym,
      -this.pm,
      this.xypm,
    );
  }

  /**
   * Check if two CEven objects are equal
   * @param {CEven} other
   */
  equals(other) {
    return (
      is_nearly(this.scalar, other.scalar) &&
      is_nearly(this.xy, other.xy) &&
      is_nearly(this.xp, other.xp) &&
      is_nearly(this.xm, other.xm) &&
      is_nearly(this.yp, other.yp) &&
      is_nearly(this.ym, other.ym) &&
      is_nearly(this.pm, other.pm) &&
      is_nearly(this.xypm, other.xypm)
    );
  }

  // Geometric product code partially generated with the help of
  // my repo math-notebook, specifically the symbolic subdirectory which
  // uses kingdon for symbolic computation.

  /**
   * Geometric product with an even multivector
   * @param {CEven} even
   * @returns {CEven}
   */
  gp_even(even) {
    const {
      scalar: As,
      xy: Axy,
      xp: Axp,
      xm: Axm,
      yp: Ayp,
      ym: Aym,
      pm: Apm,
      xypm: Axypm,
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

    const scalar =
      Apm * Bpm +
      As * Bs +
      Axm * Bxm -
      Axp * Bxp -
      Axy * Bxy -
      Axypm * Bxypm +
      Aym * Bym -
      Ayp * Byp;
    const xy =
      Apm * Bxypm +
      As * Bxy +
      Axm * Bym -
      Axp * Byp +
      Axy * Bs +
      Axypm * Bpm -
      Aym * Bxm +
      Ayp * Bxp;
    const xp =
      -Apm * Bxm +
      As * Bxp +
      Axm * Bpm +
      Axp * Bs +
      Axy * Byp -
      Axypm * Bym -
      Aym * Bxypm -
      Ayp * Bxy;
    const xm =
      -Apm * Bxp +
      As * Bxm +
      Axm * Bs +
      Axp * Bpm +
      Axy * Bym -
      Axypm * Byp -
      Aym * Bxy -
      Ayp * Bxypm;
    const yp =
      -Apm * Bym +
      As * Byp +
      Axm * Bxypm +
      Axp * Bxy -
      Axy * Bxp +
      Axypm * Bxm +
      Aym * Bpm +
      Ayp * Bs;
    const ym =
      -Apm * Byp +
      As * Bym +
      Axm * Bxy +
      Axp * Bxypm -
      Axy * Bxm +
      Axypm * Bxp +
      Aym * Bs +
      Ayp * Bpm;
    const pm =
      Apm * Bs +
      As * Bpm +
      Axm * Bxp -
      Axp * Bxm -
      Axy * Bxypm -
      Axypm * Bxy +
      Aym * Byp -
      Ayp * Bym;
    const xypm =
      Apm * Bxy +
      As * Bxypm +
      Axm * Byp -
      Axp * Bym +
      Axy * Bpm +
      Axypm * Bs -
      Aym * Bxp +
      Ayp * Bxm;

    return new CEven(scalar, xy, xp, xm, yp, ym, pm, xypm);
  }

  /**
   * Geometric product with an odd multivector
   * @param {COdd} odd
   * @returns {COdd}
   */
  gp_odd(odd) {
    const {
      scalar: As,
      xy: Axy,
      xp: Axp,
      xm: Axm,
      yp: Ayp,
      ym: Aym,
      pm: Apm,
      xypm: Axypm,
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

    const x =
      Apm * Bxpm +
      As * Bx -
      Axm * Bm +
      Axp * Bp +
      Axy * By +
      Axypm * Bypm +
      Aym * Bxym -
      Ayp * Bxyp;
    const y =
      Apm * Bypm +
      As * By -
      Axm * Bxym +
      Axp * Bxyp -
      Axy * Bx -
      Axypm * Bxpm -
      Aym * Bm +
      Ayp * Bp;
    const p =
      -Apm * Bm +
      As * Bp -
      Axm * Bxpm -
      Axp * Bx -
      Axy * Bxyp +
      Axypm * Bxym -
      Aym * Bypm -
      Ayp * By;
    const m =
      -Apm * Bp +
      As * Bm -
      Axm * Bx -
      Axp * Bxpm -
      Axy * Bxym +
      Axypm * Bxyp -
      Aym * By -
      Ayp * Bypm;
    const xyp =
      -Apm * Bxym +
      As * Bxyp -
      Axm * Bypm -
      Axp * By +
      Axy * Bp -
      Axypm * Bm +
      Aym * Bxpm +
      Ayp * Bx;
    const xym =
      -Apm * Bxyp +
      As * Bxym -
      Axm * By -
      Axp * Bypm +
      Axy * Bm -
      Axypm * Bp +
      Aym * Bx +
      Ayp * Bxpm;
    const xpm =
      Apm * Bx +
      As * Bxpm -
      Axm * Bp +
      Axp * Bm +
      Axy * Bypm +
      Axypm * By +
      Aym * Bxyp -
      Ayp * Bxym;
    const ypm =
      Apm * By +
      As * Bypm -
      Axm * Bxyp +
      Axp * Bxym -
      Axy * Bxpm -
      Axypm * Bx -
      Aym * Bp +
      Ayp * Bm;

    return new COdd(x, y, p, m, xyp, xym, xpm, ypm);
  }

  /**
   * Geometric Product
   * @param {COdd | CEven} other
   * @returns {COdd | CEven}
   */
  gp(other) {
    if (other instanceof CEven) {
      return this.gp_even(other);
    }

    return this.gp_odd(other);
  }

  /**
   * Unit sandwich where the filling is an odd multivector
   * @param {COdd} odd
   * @returns {COdd}
   */
  unit_sandwich_odd(odd) {
    return this.gp_odd(odd).gp_even(this.reverse());
  }

  /**
   * Unit sandwich where the filling is an even multivector
   * @param {CEven} even
   * @returns {CEven}
   */
  unit_sandwich_even(even) {
    return this.gp_even(even).gp_even(this.reverse());
  }

  /**
   * Compute the sandwich product A * B * A.rev() for unit versor A
   * (i.e. a CEven that squares to 1).
   * @param {CEven | COdd} other
   * @returns {CEven | COdd}
   */
  unit_sandwich(other) {
    return this.gp(other).gp(this.reverse());
  }

  /**
   * Interpolate between even multivectors
   * @param {CEven} a First multivector
   * @param {CEven} b Second multivector
   * @param {number} t Interpolation factor
   * @returns {CEven} Interpolated value
   */
  static lerp(a, b, t) {
    const s = 1 - t;

    const scalar = s * a.scalar + t * b.scalar;
    const xy = s * a.xy + t * b.xy;
    const xp = s * a.xp + t * b.xp;
    const xm = s * a.xm + t * b.xm;
    const yp = s * a.yp + t * b.yp;
    const ym = s * a.ym + t * b.ym;
    const pm = s * a.pm + t * b.pm;
    const xypm = s * a.xypm + t * b.xypm;

    return new CEven(scalar, xy, xp, xm, yp, ym, pm, xypm);
  }
}
CEven.ZERO = Object.freeze(new CEven(0, 0, 0, 0, 0, 0, 0, 0));
CEven.IDENTITY = Object.freeze(new CEven(1, 0, 0, 0, 0, 0, 0, 0));
