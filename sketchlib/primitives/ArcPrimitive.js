import { Direction } from "../../sketchlib/pga2d/Direction.js";
import { Point } from "../../sketchlib/pga2d/Point.js";
import { ArcAngles } from "../ArcAngles.js";
import { ArcLength } from "./ArcLength.js";
import { lerp } from "../lerp.js";
import { is_nearly } from "../is_nearly.js";
import { PartialPrimitive } from "./Primitive.js";

/**
 * Circular arc primitive defined as a circle and start and stop angles
 * @implements {PartialPrimitive}
 * @implements {ArcLength}
 */
export class ArcPrimitive {
  /**
   * Constructor
   * @param {Point} center The center of the circle
   * @param {number} radius The radius of the circle
   * @param {ArcAngles} angles The two angles defining the arc, !!! CLOCKWISE !!! since p5.js is y-down
   */
  constructor(center, radius, angles) {
    this.center = center;
    this.radius = radius;
    this.angles = angles;
  }

  /**
   * Draw a circular arc
   * @param {import("p5")} p the p5.js library
   */
  draw(p) {
    const { center, radius, angles } = this;
    const { x, y } = center;
    const diameter = 2 * radius;

    let { start_angle, end_angle } = angles;

    // p5.js's arc command specifies angles in CW order from start to stop.
    // If the direction of the arc is backwards, we need to swap the order
    // of the arguments.
    if (angles.direction === -1) {
      [start_angle, end_angle] = [end_angle, start_angle];
    }

    // Note: p5 is y-down so we need to flip the angles
    p.arc(x, y, diameter, diameter, start_angle, end_angle, p.OPEN);
  }

  /**
   *
   * @param {ArcPrimitive} other
   * @returns {boolean}
   */
  equals(other) {
    return (
      this.center.equals(other.center) &&
      is_nearly(this.radius, other.radius) &&
      this.angles.equals(other.angles)
    );
  }

  /**
   * Render a partial version of the primitive
   * @param {number} t Interpolation factor in [0, 1]
   * @returns {ArcPrimitive}
   */
  render_partial(t) {
    const interpolated_angles = new ArcAngles(
      this.angles.start_angle,
      lerp(this.angles.start_angle, this.angles.end_angle, t),
    );
    return new ArcPrimitive(this.center, this.radius, interpolated_angles);
  }

  /**
   * Render a partial version of the arc between the two given times
   * @param {number} t_start start t value in [0, 1]
   * @param {number} t_end end t value in [0, 1]
   * @returns {ArcPrimitive}
   */
  render_between(t_start, t_end) {
    const start_angle = lerp(
      this.angles.start_angle,
      this.angles.end_angle,
      t_start,
    );
    const end_angle = lerp(
      this.angles.start_angle,
      this.angles.end_angle,
      t_end,
    );

    const interpolated_angles = new ArcAngles(start_angle, end_angle);
    return new ArcPrimitive(this.center, this.radius, interpolated_angles);
  }

  /**
   * Get the position at time t in the curve
   * @param {number} t Interpolation factor in [0, 1]
   * @returns {Point} Current point at the curve a time t
   */
  get_position(t) {
    const angle = lerp(this.angles.start_angle, this.angles.end_angle, t);
    const offset = Direction.from_angle(angle).scale(this.radius);
    return this.center.add(offset);
  }

  /**
   * Get a tangent direction at time t
   * @param {number} t Interpolation factor in [0, 1]
   * @returns {Direction} Unit direction along the curve at time t
   */
  get_tangent(t) {
    const angle = lerp(this.angles.start_angle, this.angles.end_angle, t);
    // On a circle, the normal is always 90 degrees away from the tangent.
    // though there are two options depending on the direction of the arc
    const normal = Direction.from_angle(angle).scale(this.radius);
    return this.angles.direction < 0 ? normal.rot270() : normal.rot90();
  }

  /**
   *
   */
  get arc_length() {
    return this.angles.angle * this.radius;
  }

  /**
   * For an arc primitive, the arc length i
   * @param {number} t
   * @returns number
   */
  get_arc_length(t) {
    return t * this.arc_length;
  }

  /**
   *
   * @param {number} arc_length
   * @returns
   */
  get_t(arc_length) {
    return arc_length / this.arc_length;
  }
}
