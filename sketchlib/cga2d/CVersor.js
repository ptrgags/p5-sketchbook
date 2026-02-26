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
   * For convenience, compose dilation and rotation
   * @param {number} factor
   * @param {number} angle
   * @returns {CVersor}
   */
  static spiral(factor, angle) {
    const scale = CVersor.dilation(factor);
    const rot = CVersor.rotation(angle);
    return scale.compose(rot);
  }

  /**
   * An elliptic Mobius transformation is a generalization of rotation.
   * It swirls space around a point pair. Like a 2D vortex ring
   *
   * This method creates the simple case where the point pair is at opposite
   * points of the unit circle.
   * @param {Direction} direction Direction of flow at the origin, this will be normalized.
   * @param {number} angle Angle of rotation, measured around one of the poles.
   * @return {CVersor}
   */
  static elliptic(direction, angle) {
    // exp(-angle/2 * normalize(direction) wedge p)
    // = cos(-angle/2) + sin(-angle/2) (dx x + dy y) wedge p
    // = cos(angle/2) - sin(angle/2) (dx xp + dy yp)
    const c = Math.cos(angle / 2);
    const s = Math.sin(angle / 2);
    const { x: dx, y: dy } = direction.normalize();

    const scalar = c;
    const xp = -s * dx;
    const yp = -s * dy;
    return new CVersor(new CEven(scalar, 0, xp, 0, yp, 0, 0, 0));
  }

  /**
   * Create a hyperbolic Mobius transform, i.e. a transformation
   * that moves points along circular arcs from one point on the unit
   * circle to the opposite point.
   * @param {Direction} direction The direction of flow at the origin
   * @param {number} factor positive number indicating the scale factor. 1 means identity, >1 means stretch in the flow direction, <1 means shrink (flow opposite the direction)
   * @returns {CVersor}
   */
  static hyperbolic(direction, factor) {
    // exp(-ln(factor)/2 * normalize(direction) wedge m);
    // See dilation() for some of the derivation, we get
    // 1/2(sqrt(factor) + 1/sqrt(factor)) - 1/2(sqrt(factor) - 1/sqrt(factor)) (dx x + dy y) wedge m
    // |-------------C------------------| - |---------------S----------------|
    // C - S (dx xm + dy ym)
    const sqrt_factor = Math.sqrt(factor);
    const inv_sqrt = 1.0 / sqrt_factor;
    const c = 0.5 * (sqrt_factor + inv_sqrt);
    const s = 0.5 * (sqrt_factor - inv_sqrt);
    const { x: dx, y: dy } = direction.normalize();

    const scalar = c;
    const xm = -s * dx;
    const ym = -s * dy;

    return new CVersor(new CEven(scalar, 0, 0, xm, 0, ym, 0, 0));
  }

  /**
   * Create a loxodromic Mobius transformation
   * as L = hyperbolic * elliptic
   * @param {Direction} hyperbolic_dir The direction of the hyperbolic stretching. The rotation will be perpendicular to this.
   * @param {number} factor Scale factor
   * @param {number} angle Rotation angle
   */
  static loxodromic(hyperbolic_dir, factor, angle) {
    const hyp = CVersor.hyperbolic(hyperbolic_dir, factor);
    const ellip = CVersor.elliptic(hyperbolic_dir.rot90(), angle);
    // These transformations are orthogonal, so we could compose them
    // in either order.
    return hyp.compose(ellip);
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
/**
 * Inversion in the unit circle is represented
 * by the vector p
 * @type {CVersor}
 */
CVersor.INVERSION = Object.freeze(
  new CVersor(new COdd(0, 0, 1, 0, 0, 0, 0, 0)),
);
