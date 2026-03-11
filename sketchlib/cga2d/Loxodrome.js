import { is_nearly } from "../is_nearly.js";
import { Direction } from "../pga2d/Direction.js";
import { Line } from "../pga2d/Line.js";
import { Primitive } from "../primitives/Primitive.js";
import { CEven } from "./CEven.js";
import { Cline } from "./Cline.js";
import { ClineArc } from "./ClineArc.js";
import { COdd } from "./COdd.js";
import { ConformalPrimitive } from "./ConfomalPrimitive.js";
import { CVersor } from "./CVersor.js";
import { NullPoint } from "./NullPoint.js";

/**
 * Fixed curve of a loxodromic transformation.
 * It is represented as a double spiral with fixed points on
 * opposite sides of the unit circle, conjugated by another
 * Mobius map.
 * @implements {ConformalPrimitive}
 */
export class Loxodrome {
  /**
   * Constructor
   * @param {Direction} direction Direction of the loxodromic transformation, this will be normalized
   * @param {number} scale_factor nonzero scale factor for the hyperbolic part of the transformation
   * @param {number} rotation_angle Rotation angle for the elliptic part of the transformation
   * @param {number} phase Phase angle in radians for a point on the equator. The loxodrome will go through this point
   * @param {CVersor} xform A transformation that will be applied to the loxodrome to conjugate it into other shapes (such as log spirals)
   */
  constructor(direction, scale_factor, rotation_angle, phase, xform) {
    // Canonical form: the scale factor is always stored as >= 1 and
    // the direction is flipped to match. This way, the direction
    // points towards the attracting fixed point always.
    if (scale_factor < 1) {
      scale_factor = 1 / scale_factor;
      direction = direction.neg();
    }
    this.direction = direction;
    this.scale_factor = scale_factor;
    this.rotation_angle = rotation_angle;
    this.phase = phase;
    this.xform = xform;
    this.primitive = this.compute_orbit();
  }

  compute_orbit() {
    const no_scaling = is_nearly(this.scale_factor, 1);
    const no_rotation = is_nearly(this.rotation_angle, 0);

    // The orbit always starts on the equator. The point is defined
    // by a phase angle. For an elliptic transformation that fixes
    // the equator, it moves the origin to tan(phase).
    let start_point;
    if (is_nearly(this.phase, Math.PI)) {
      start_point = NullPoint.INF;
    } else {
      const equator_point = this.direction
        .rot90()
        .scale(Math.tan(this.phase / 2))
        .to_point();
      start_point = NullPoint.from_point(equator_point);
    }

    if (no_scaling && no_rotation) {
      // the transformation is identity, so the orbit is the start point
      return this.xform.transform(start_point);
    }

    if (no_scaling) {
      // the transformation is elliptic, so the orbit is the whole equator
      const equator = Cline.from_line(Line.thru_origin(this.direction));
      return this.xform.transform(equator);
    }

    const fix_minus = NullPoint.from_point(this.direction.neg().to_point());
    const fix_plus = NullPoint.from_point(this.direction.to_point());

    if (no_rotation) {
      // The transformation is hyperbolic, so the orbit is a meridian
      // (arc on the globe from pole to pole through a point on the equator)
      const great_circle = Line.thru_origin(this.direction.rot90());
      const meridian = new ClineArc(
        Cline.from_line(great_circle),
        fix_minus,
        NullPoint.ORIGIN,
        fix_plus,
      );
      return this.xform.transform(meridian);
    }

    // If we reached here, we have a true loxodrome, which spirals out of
    // one fixed point into the other. But how this looks on the screen
    // has a couple corner cases.

    // If either of the fixed points gets sent to infinity, the end result
    // looks like a log spiral. This will be handled in a future PR
    const image_minus = fix_minus.transform(this.xform.versor);
    const image_plus = fix_plus.transform(this.xform.versor);
    if (image_minus.is_inf || image_plus.is_inf) {
      console.warn("not yet implemented: log spiral");
      return Primitive.EMPTY;
    }

    return this.approxodrome(image_minus, image_plus);
  }

  /**
   *
   * @param {COdd | CEven} versor
   * @returns {ConformalPrimitive}
   */
  transform(versor) {
    const cversor = new CVersor(versor);
    const xform = cversor.compose(this.xform);
    return new Loxodrome(
      this.direction,
      this.scale_factor,
      this.rotation_angle,
      this.phase,
      xform,
    );
  }

  draw(p) {
    this.primitive.draw(p);
  }
}
