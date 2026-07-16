import { is_nearly } from "../is_nearly.js";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Motor } from "../pga2d/versors.js";

/**
 * @typedef {{
 *  translation?: Direction
 *  rotation?: number
 *  flip?: boolean
 * }} RigidOptions
 */

/**
 * Rigid transformation in the form:
 *
 * translate(offset) * rotate(angle) * flip_y?
 */
export class Rigid {
  /**
   * Constructor
   * @param {RigidOptions} options Settings for the rigid transformation
   */
  constructor(options) {
    this.translation = options.translation ?? Direction.ZERO;
    this.rotation = options.rotation ?? 0;
    this.flip = options.flip ?? false;
  }

  /**
   *
   * @param {Rigid} other
   * @returns {boolean}
   */
  equals(other) {
    return (
      is_nearly(this.rotation, other.rotation) &&
      this.flip === other.flip &&
      this.translation.equals(other.translation)
    );
  }

  inverse() {
    // (TR)^-1 = R^-1 T^-1
    // = T(R^-1 * -d) * R^-1
    if (!this.flip) {
      const rotation = Motor.rotation(Point.ORIGIN, -this.rotation);
      const offset = rotation.transform_dir(this.translation.neg());
      return new Rigid({
        translation: offset,
        rotation: -this.rotation,
      });
    }

    // (TRY)^-1 = Y^-1 * R^-1 * T^-1
    // = Y * T(R^-1 * -d) * R^-1
    // = T(Y * R^(-1) * -d) * Y * R^-1
    // = T(Y * R^(-1) * -d) * R * Y
    const rotation = Motor.rotation(Point.ORIGIN, -this.rotation);
    const offset = rotation.transform_dir(this.translation.neg()).flip_y();

    return new Rigid({
      translation: offset,
      rotation: this.rotation,
      flip: this.flip,
    });
  }

  /**
   * Compose
   * @param {Rigid} other
   * @returns {Rigid}
   */
  compose(other) {
    throw new Error("not implemented");
  }

  /**
   * Compute the rigid transformation that takes other to this transformation.
   * i.e. difference = A * B^-1
   * @param {Rigid} other
   * @returns {Rigid}
   */
  difference(other) {
    throw new Error("not implemented");
  }

  /**
   * Use this rigid transformation to conjugate another one,
   * i.e. compute A * B * A^-1
   * @param {Rigid} other
   * @returns {Rigid}
   */
  conjugate(other) {
    throw new Error("not implemented");
  }

  /**
   * Apply the transformations to p5
   * @param {import("p5")} p
   */
  apply(p) {
    p.translate(this.translation.x, this.translation.y);
    p.rotate(this.rotation);
    if (this.flip) {
      p.scale(1, -1);
    }
  }

  /**
   * Convenience constructor for a translation
   * @param {Direction} offset
   * @returns {Rigid}
   */
  static translation(offset) {
    return new Rigid({ translation: offset });
  }

  /**
   * Convenience constructor for a rotation transformation
   * @param {number} angle Rotation angle in radians
   * @returns {Rigid}
   */
  static rotation(angle) {
    return new Rigid({ rotation: angle });
  }

  /**
   * Convenience constructor for reflection in a line through the origin
   * but potentially rotated
   * @param {number} theta
   * @returns {Rigid}
   */
  static reflection(theta) {
    // R(theta) * flip_y * R(theta)^(-1)
    // = R(theta)^2 * flip_y
    return new Rigid({ flip: true, rotation: 2 * theta });
  }

  /**
   * Interpolate between rigid transformations. this interpolates the
   * translation amount and rotation angle separately.
   *
   * NOTE: this will throw an error if a and b have opposite orientations,
   * as intermediate transformations are not rigid
   * @param {Rigid} a First transformation
   * @param {Rigid} b Second transformation. It must have the same orientation as a
   * @param {number} t interpolation factor, usually in [0, 1]
   * @return {Rigid} Rigid transformation
   */
  static interpolate(a, b, t) {
    if (a.flip !== b.flip) {
      throw new Error("a and b must have the same orientation");
    }

    const translation = Direction.lerp(a.translation, b.translation, t);
    const rotation = lerp(a.rotation, b.rotation, t);
    const flip = a.flip;

    return new Rigid({ translation, rotation, flip });
  }
}
Rigid.IDENTITY = Object.freeze(new Rigid({}));
Rigid.FLIP_Y = Object.freeze(new Rigid({ flip: true }));
