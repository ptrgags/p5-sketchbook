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
