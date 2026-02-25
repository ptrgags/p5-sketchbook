import { Direction } from "../pga2d/Direction.js";
import { CEven } from "./CEven.js";
import { Cline } from "./Cline.js";
import { COdd } from "./COdd.js";
import { NullPoint } from "./NullPoint.js";

export class CVersor {
  /**
   * Constructor. Don't use this, use specific constructors
   * @param {CEven | COdd} versor unit multivector
   */
  constructor(versor) {
    this.versor = versor;
  }

  /**
   * Check if two versors are equal
   * @param {CVersor} other
   * @returns {boolean}
   */
  equals(other) {
    if (this.versor instanceof CEven && other.versor instanceof CEven) {
      return this.versor.equals(other.versor);
    } else if (this.versor instanceof COdd && other.versor instanceof COdd) {
      return this.versor.equals(other.versor);
    } else {
      return false;
    }
  }

  /**
   * Reflect through the origin
   * @param {Direction} normal
   * @returns {CVersor}
   */
  static reflection(normal) {
    const { x, y } = normal.normalize();

    const versor = new COdd(x, y, 0, 0, 0, 0, 0, 0);
    return new CVersor(versor);
  }

  /**
   * Reflect in the unit circle (a circle inversion)
   * @returns {CVersor}
   */
  static circle_inversion() {
    return new CVersor(new COdd(0, 0, 1, 0, 0, 0, 0, 0));
  }

  /**
   * Translate by the given offset
   * @param {Direction} offset The offset length and direction
   * @returns {CVersor}
   */
  static translation(offset) {
    const { x, y } = offset;

    // R = exp(-offset/2 inf)
    //   = 1 - (offset/2) inf
    //   = 1 - (offset/2) (m + p)
    //   = 1 - (offset/2)m - (offset/2)p
    // letting dx = -offset.x/2
    //         dy = -offset.y/2
    //   = 1 + (dx x + dy y)m + (dx x + dy y)p
    //   = 1 + dx xm + dy ym + dx xp + dy yp
    const dx = -x / 2;
    const dy = -y / 2;

    const xp = dx;
    const xm = dx;
    const yp = dy;
    const ym = dy;
    const versor = new CEven(1, 0, xp, xm, yp, ym, 0, 0);
    return new CVersor(versor);
  }

  /**
   * Rotate in the xy-plane
   * @param {number} angle Angle in radians
   * @return {CVersor}
   */
  static rotation(angle) {
    // R = exp(-angle/2 xy)
    //   = cos(-angle/2) + sin(-angle/2) xy
    //   = cos(angle/2) - sin(angle/2) xy
    const c = Math.cos(angle / 2);
    const s = -Math.sin(angle / 2);
    const versor = new CEven(c, s, 0, 0, 0, 0, 0, 0);
    return new CVersor(versor);
  }

  /**
   * Uniform scaling, aka dilation
   * @param {number} factor nonzero scale factor
   * @returns {CVersor}
   */
  static dilation(factor) {
    // R = exp(-ln(factor)/2 pm)
    // = cosh(-ln(factor)/2) + sinh(-ln(factor)/2) pm
    // = cosh(ln(factor)/2) - sinh(ln(factor)/2) pm

    // SIDEQUEST: cosh(a ln(x)) and sinh(a ln(x)) ------
    // cosh(a ln(x)) = 1/2exp(a ln(x)) + 1/2exp(-a ln(x))
    //   = 1/2exp(ln(x^a)) + 1/2exp(ln(x^(-a)))
    //    = 1/2(x^a) + 1/2(x^(-a))
    //    = 1/2(x^a + x^(-a))
    //
    // sinh(a ln(x)) is the same thing except the second term
    // gets a negative sign, so we have
    // sinh(a ln(x)) = 1/2(x^a - x^(-a))
    // -------------------------------------------------
    // we now return to our regularly scheduled programming...

    // cosh(1/2 ln(factor)) = 1/2(factor^(1/2) + factor^(-1/2))
    //   = 1/2(sqrt(factor) + 1/sqrt(factor))
    //
    // and similarly,
    //
    // sinh(1/2 ln(factor)) = 1/2(sqrt(factor) - 1/sqrt(factor))
    //
    // so all together we have:
    // R = 1/2(sqrt(factor) + 1/sqrt(factor)) - 1/2(sqrt(factor) - 1/sqrt(factor)) pm

    const sqrt_factor = Math.sqrt(factor);
    const inv_sqrt = 1.0 / sqrt_factor;
    const c = 0.5 * (sqrt_factor + inv_sqrt);
    const s = -0.5 * (sqrt_factor - inv_sqrt);
    const versor = new CEven(c, 0, 0, 0, 0, 0, s, 0);
    return new CVersor(versor);
  }

  /**
   * Invert the versor. Since these versors are represented
   * by unit multivectors, this can be done using
   * versor.reverse() rather than the inverse calculation
   * which is rather gnarly
   * @returns {CVersor}
   */
  inv() {
    return new CVersor(this.versor.reverse());
  }

  /**
   * Compose two versors together
   * @param {CVersor} other
   * @returns {CVersor} the composition of the versors
   */
  compose(other) {
    const versor = this.versor.gp(other.versor);
    return new CVersor(versor);
  }

  /**
   * Use this versor to conjugate another versor via sandwich
   * product
   * @param {CVersor} other
   * @returns {CVersor}
   */
  conjugate(other) {
    const versor = this.versor.unit_sandwich(other.versor);
    return new CVersor(versor);
  }

  /**
   * Transform a Cline object
   * @param {Cline} cline
   */
  transform_cline(cline) {
    return cline.transform(this.versor);
  }

  /**
   * Transform a Null Point object
   * @param {NullPoint} point
   */
  transform_point(point) {
    return point.transform(this.versor);
  }
}
/**
 * The identity versor is the scalar 1
 * @type {CVersor}
 */
CVersor.IDENTITY = Object.freeze(
  new CVersor(new CEven(1, 0, 0, 0, 0, 0, 0, 0)),
);
