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

  reverse() {
    return this;
  }

  /**
   * Geometric product with an odd multivector
   * @param {COdd} other
   * @returns {CEven}
   */
  gp_odd(other) {
    /**
     * Geometric Product ========================
A: Ax 𝐞₁ + Ay 𝐞₂ + Ap 𝐞₃ + An 𝐞₄ + Axyp 𝐞₁₂₃ + Axyn 𝐞₁₂₄ + Axpn 𝐞₁₃₄ + Aypn 𝐞₂₃₄
B: Bx 𝐞₁ + By 𝐞₂ + Bp 𝐞₃ + Bn 𝐞₄ + Bxyp 𝐞₁₂₃ + Bxyn 𝐞₁₂₄ + Bxpn 𝐞₁₃₄ + Bypn 𝐞₂₃₄
(-An*Bn + Ap*Bp + Ax*Bx + Axpn*Bxpn + Axyn*Bxyn - Axyp*Bxyp + Ay*By + Aypn*Bypn)
(-An*Bxyn + Ap*Bxyp + Ax*By + Axpn*Bypn - Axyn*Bn + Axyp*Bp - Ay*Bx - Aypn*Bxpn) 𝐞₁₂ 
(-An*Bxpn - Ap*Bx + Ax*Bp - Axpn*Bn - Axyn*Bypn - Axyp*By - Ay*Bxyp + Aypn*Bxyn) 𝐞₁₃ 
(-An*Bx - Ap*Bxpn + Ax*Bn - Axpn*Bp - Axyn*By - Axyp*Bypn - Ay*Bxyn + Aypn*Bxyp) 𝐞₁₄ 
(-An*Bypn - Ap*By + Ax*Bxyp - Axpn*Bxyn + Axyn*Bxpn + Axyp*Bx + Ay*Bp - Aypn*Bn) 𝐞₂₃ 
(-An*By - Ap*Bypn + Ax*Bxyn - Axpn*Bxyp + Axyn*Bx + Axyp*Bxpn + Ay*Bn - Aypn*Bp) 𝐞₂₄ 
(-An*Bp + Ap*Bn + Ax*Bxpn + Axpn*Bx + Axyn*Bxyp - Axyp*Bxyn + Ay*Bypn + Aypn*By) 𝐞₃₄
(-An*Bxyp + Ap*Bxyn + Ax*Bypn + Axpn*By - Axyn*Bp + Axyp*Bn - Ay*Bxpn - Aypn*Bx) 𝐞₁₂₃₄
     */
    return CEven.ZERO;
  }

  /**
   * Geometric product with an even multivector
   * @param {CEven} other
   * @returns {COdd}
   */
  gp_even(other) {
    /**
     * Geometric Product ========================
A: Ax 𝐞₁ + Ay 𝐞₂ + Ap 𝐞₃ + An 𝐞₄ + Axyp 𝐞₁₂₃ + Axyn 𝐞₁₂₄ + Axpn 𝐞₁₃₄ + Aypn 𝐞₂₃₄
B: Bs + Bxy 𝐞₁₂ + Bxp 𝐞₁₃ + Bxn 𝐞₁₄ + Byp 𝐞₂₃ + Byn 𝐞₂₄ + Bpn 𝐞₃₄ + Bxypn 𝐞₁₂₃₄
(An*Bxn - Ap*Bxp + Ax*Bs + Axpn*Bpn + Axyn*Byn - Axyp*Byp - Ay*Bxy - Aypn*Bxypn) 𝐞₁ 
(An*Byn - Ap*Byp + Ax*Bxy + Axpn*Bxypn - Axyn*Bxn + Axyp*Bxp + Ay*Bs + Aypn*Bpn) 𝐞₂ 
(An*Bpn + Ap*Bs + Ax*Bxp - Axpn*Bxn - Axyn*Bxypn - Axyp*Bxy + Ay*Byp - Aypn*Byn) 𝐞₃ 
(An*Bs + Ap*Bpn + Ax*Bxn - Axpn*Bxp - Axyn*Bxy - Axyp*Bxypn + Ay*Byn - Aypn*Byp) 𝐞₄
(An*Bxypn + Ap*Bxy + Ax*Byp - Axpn*Byn + Axyn*Bpn + Axyp*Bs - Ay*Bxp + Aypn*Bxn) 𝐞₁₂₃ 
(An*Bxy + Ap*Bxypn + Ax*Byn - Axpn*Byp + Axyn*Bs + Axyp*Bpn - Ay*Bxn + Aypn*Bxp) 𝐞₁₂₄ 
(An*Bxp - Ap*Bxn + Ax*Bpn + Axpn*Bs + Axyn*Byp - Axyp*Byn - Ay*Bxypn - Aypn*Bxy) 𝐞₁₃₄ 
(An*Byp - Ap*Byn + Ax*Bxypn + Axpn*Bxy - Axyn*Bxp + Axyp*Bxn + Ay*Bpn + Aypn*Bs) 𝐞₂₃₄
     */
    return this;
  }

  gp(other) {
    if (other instanceof COdd) {
      return this.gp_odd(other);
    }

    return this.gp_even(other);
  }

  unit_sandwich(other) {
    return this.gp(other).gp(this.reverse());
  }
}
COdd.ZERO = Object.freeze(new COdd(0, 0, 0, 0, 0, 0, 0, 0));
