import { is_nearly } from "../is_nearly.js";
import { COdd } from "./COdd.js";

/**
 * @template T
 * @typedef {T extends (COdd | CEven) ? COdd : CEven} SameParity<T>
 */

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
   * Add two CEvens together
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
   *
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

  // in 2D CGA, the anti (hodge) dual has the same signs as the dual, so
  // this function is free!
  antidual = this.dual;

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

  inverse() {
    return new CEven(0, 0, 0, 0, 0, 0, 0, 0);
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

  /**
   * Geometric product with an even multivector
   * @param {CEven} even
   * @returns {CEven}
   */
  gp_even(even) {
    /**
     * Geometric Product ========================
A: As + Axy 𝐞₁₂ + Axp 𝐞₁₃ + Axn 𝐞₁₄ + Ayp 𝐞₂₃ + Ayn 𝐞₂₄ + Apn 𝐞₃₄ + Axypn 𝐞₁₂₃₄
B: Bs + Bxy 𝐞₁₂ + Bxp 𝐞₁₃ + Bxn 𝐞₁₄ + Byp 𝐞₂₃ + Byn 𝐞₂₄ + Bpn 𝐞₃₄ + Bxypn 𝐞₁₂₃₄
(Apn*Bpn + As*Bs + Axn*Bxn - Axp*Bxp - Axy*Bxy - Axypn*Bxypn + Ayn*Byn - Ayp*Byp)
(Apn*Bxypn + As*Bxy + Axn*Byn - Axp*Byp + Axy*Bs + Axypn*Bpn - Ayn*Bxn + Ayp*Bxp) 𝐞₁₂ 
(-Apn*Bxn + As*Bxp + Axn*Bpn + Axp*Bs + Axy*Byp - Axypn*Byn - Ayn*Bxypn - Ayp*Bxy) 𝐞₁₃ 
(-Apn*Bxp + As*Bxn + Axn*Bs + Axp*Bpn + Axy*Byn - Axypn*Byp - Ayn*Bxy - Ayp*Bxypn) 𝐞₁₄ 
(-Apn*Byn + As*Byp + Axn*Bxypn + Axp*Bxy - Axy*Bxp + Axypn*Bxn + Ayn*Bpn + Ayp*Bs) 𝐞₂₃ 
(-Apn*Byp + As*Byn + Axn*Bxy + Axp*Bxypn - Axy*Bxn + Axypn*Bxp + Ayn*Bs + Ayp*Bpn) 𝐞₂₄ 
(Apn*Bs + As*Bpn + Axn*Bxp - Axp*Bxn - Axy*Bxypn - Axypn*Bxy + Ayn*Byp - Ayp*Byn) 𝐞₃₄
(Apn*Bxy + As*Bxypn + Axn*Byp - Axp*Byn + Axy*Bpn + Axypn*Bs - Ayn*Bxp + Ayp*Bxn) 𝐞₁₂₃
     */
    return even;
  }

  /**
   * Geometric product with an odd multivector
   * @param {COdd} odd
   * @returns {COdd}
   */
  gp_odd(odd) {
    /**
     * Geometric Product ========================
A: As + Axy 𝐞₁₂ + Axp 𝐞₁₃ + Axn 𝐞₁₄ + Ayp 𝐞₂₃ + Ayn 𝐞₂₄ + Apn 𝐞₃₄ + Axypn 𝐞₁₂₃₄
B: Bx 𝐞₁ + By 𝐞₂ + Bp 𝐞₃ + Bn 𝐞₄ + Bxyp 𝐞₁₂₃ + Bxyn 𝐞₁₂₄ + Bxpn 𝐞₁₃₄ + Bypn 𝐞₂₃₄
(Apn*Bxpn + As*Bx - Axn*Bn + Axp*Bp + Axy*By + Axypn*Bypn + Ayn*Bxyn - Ayp*Bxyp) 𝐞₁ 
(Apn*Bypn + As*By - Axn*Bxyn + Axp*Bxyp - Axy*Bx - Axypn*Bxpn - Ayn*Bn + Ayp*Bp) 𝐞₂ 
(-Apn*Bn + As*Bp - Axn*Bxpn - Axp*Bx - Axy*Bxyp + Axypn*Bxyn - Ayn*Bypn - Ayp*By) 𝐞₃ 
(-Apn*Bp + As*Bn - Axn*Bx - Axp*Bxpn - Axy*Bxyn + Axypn*Bxyp - Ayn*By - Ayp*Bypn) 𝐞₄
(-Apn*Bxyn + As*Bxyp - Axn*Bypn - Axp*By + Axy*Bp - Axypn*Bn + Ayn*Bxpn + Ayp*Bx) 𝐞₁₂₃ 
(-Apn*Bxyp + As*Bxyn - Axn*By - Axp*Bypn + Axy*Bn - Axypn*Bp + Ayn*Bx + Ayp*Bxpn) 𝐞₁₂₄ 
(Apn*Bx + As*Bxpn - Axn*Bp + Axp*Bn + Axy*Bypn + Axypn*By + Ayn*Bxyp - Ayp*Bxyn) 𝐞₁₃₄ 
(Apn*By + As*Bypn - Axn*Bxyp + Axp*Bxyn - Axy*Bxpn - Axypn*Bx - Ayn*Bp + Ayp*Bn) 𝐞₂₃₄
     */
    return odd;
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
   * Compute the sandwich product A * B * A.rev() for unit versor A
   * (i.e. a CEven that squares to 1).
   * @param {CEven | COdd} other
   * @returns {CEven | COdd}
   */
  unit_sandwich(other) {
    return this.gp(other).gp(this.reverse());
  }

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
