export class CGAOdd {
  /**
   * Constructor
   * @param {number} x
   * @param {number} y
   * @param {number} p
   * @param {number} n
   * @param {number} xyp
   * @param {number} xyn
   * @param {number} xpn
   * @param {number} ypn
   */
  constructor(x, y, p, n, xyp, xyn, xpn, ypn) {
    this.x = x;
    this.y = y;
    this.p = p;
    this.n = n;
    this.xyp = xyp;
    this.xyn = xyn;
    this.xpn = xpn;
    this.ypn = ypn;
  }

  /**
   * Convenience constructor for a vector
   * @param {number} x
   * @param {number} y
   * @param {number} p
   * @param {number} n
   * @returns {CGAOdd} An odd multivector with a vector part but zero trivector part
   */
  static vector(x, y, p, n) {
    return new CGAOdd(x, y, p, n, 0, 0, 0, 0);
  }

  /**
   * Get the squared magnitude for this multivector
   *
   * @type {number}
   */
  get mag_sqr() {
    const { x: ax, y: ay, p: ap, n: an } = this;
    return ax * ax + ay * ay + ap * ap - an * an;
  }

  /**
   * Sandwich product ABA^{-1}
   * @param {CGAOdd} other
   */
  sandwich_odd(other) {
    const { x: ax, y: ay, p: ap, n: an } = this;
    const { x: bx, y: by, p: bp, n: bn } = other;

    const bread_mag_sqr = this.mag_sqr;

    const x =
      (an ** 2 * bx -
        2 * an * ax * bn -
        ap ** 2 * bx +
        2 * ap * ax * bp +
        ax ** 2 * bx +
        2 * ax * ay * by -
        ay ** 2 * bx) /
      bread_mag_sqr;
    const y =
      (an ** 2 * by -
        2 * an * ay * bn -
        ap ** 2 * by +
        2 * ap * ay * bp -
        ax ** 2 * by +
        2 * ax * ay * bx +
        ay ** 2 * by) /
      bread_mag_sqr;
    const p =
      (an ** 2 * bp -
        2 * an * ap * bn +
        ap ** 2 * bp +
        2 * ap * ax * bx +
        2 * ap * ay * by -
        ax ** 2 * bp -
        ay ** 2 * bp) /
      bread_mag_sqr;
    const n =
      (-(an ** 2 * bn) +
        2 * an * ap * bp +
        2 * an * ax * bx +
        2 * an * ay * by -
        ap ** 2 * bn -
        ax ** 2 * bn -
        ay ** 2 * bn) /
      bread_mag_sqr;

    // odd sandwich odd requires an additional negative sign
    return new CGAOdd(-x, -y, -p, -n, 0, 0, 0, 0);
  }
}
