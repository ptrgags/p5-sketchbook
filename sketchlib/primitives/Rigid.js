import { is_nearly } from "../is_nearly.js";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Motor } from "../pga2d/versors.js";
import { lerp } from "../lerp.js";

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
   * Compose two transformations this * other
   * @param {Rigid} other Another transformation
   * @returns {Rigid} The transformation that represents applying other, then
   * applying this
   */
  compose(other) {
    // T1 * R1 * Y1? * T2 * R2 * Y2?
    // = T1 * T(R1 * Y1 * d2) * R1 * Y1? * R2 * Y2?
    // = T1 * T(R1 * Y1 * d2) * R1 * R2^(+/-1) * Y1? * Y2?
    const motor = Motor.rotation(Point.ORIGIN, this.rotation);

    const flipped_offset = this.flip
      ? other.translation.neg()
      : other.translation;
    const translation = this.translation.add(
      motor.transform_dir(flipped_offset),
    );

    const r2_sign = this.flip ? -1 : 1;
    const rotation = this.rotation + r2_sign * other.rotation;

    return new Rigid({
      translation,
      rotation,
      // using !== as logical XOR
      flip: this.flip !== other.flip,
    });
  }

  /**
   * Compute the rigid transformation that takes other to this transformation.
   * i.e. difference = A * B^-1
   * @param {Rigid} other
   * @returns {Rigid}
   */
  difference(other) {
    return this.compose(other.inverse());
  }

  /**
   * Use this rigid transformation to conjugate another one,
   * i.e. compute A * B * A^-1
   * @param {Rigid} other
   * @returns {Rigid}
   */
  conjugate(other) {
    // T1 * R1 * Y1 * T2 * R2 * Y2 * Y1 * R1^-1 * T1^-1
    // = T1 * T(R1 * Y1 * d2) * R1 * Y1 * R2 * Y2 * Y1 * R1^-1 * T1^-1
    // = T1 *
    //   T(R1 * Y1 * d2) *
    //   T(R1 * Y1 * R2 * Y2 * Y1 * R1^-1 * -d1) *
    //   R1 * Y1 * R2 * Y2 * Y1 * R1^-1
    // = T1 *
    //   T(R1 * Y1 * d2) *
    //   T(R1 * Y1 * R2 * Y2 * Y1 * R1^-1 * -d1) *
    //   R1 * R2^(s1) * R1^(-s2) *
    //   Y1 * Y2 * Y1
    //
    // where s1, s2 are -1 when the respective flip is present, and 1 otherwise.

    const sign_r1 = this.flip ? -1 : 1;
    const sign_r2 = other.flip ? -1 : 1;

    const motor1 = Motor.rotation(Point.ORIGIN, this.rotation);
    const motor2 = Motor.rotation(Point.ORIGIN, other.rotation);

    // oof, quite a chain of steps
    const term1 = this.translation;

    const flipped_d2 = this.flip ? other.translation.neg() : other.translation;
    const term2 = motor1.transform_dir(flipped_d2);

    const tr_inv = motor1.reverse().transform_dir(this.translation.neg());
    const flipped_tr_inv = this.flip !== other.flip ? tr_inv.neg() : tr_inv;
    const rotated_flipped = motor2.transform_dir(flipped_tr_inv);
    const flip_rot_flip = this.flip ? rotated_flipped.neg() : rotated_flipped;
    const term3 = motor1.transform_dir(flip_rot_flip);

    const translation = term1.add(term2).add(term3);

    // note that the contribution from R1 is either 0 (no Y2 present) or
    // 2R1 when Y2 is present
    const rotation = (1 - sign_r2) * this.rotation + sign_r1 * other.rotation;

    return new Rigid({
      translation,
      rotation,
      // since Y1 is present an even number of times, we can ignore it
      flip: other.flip,
    });
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
