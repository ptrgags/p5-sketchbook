import { Point } from "../../pga2d/Point.js";
import { ArcAngles } from "../ArcAngles.js";
import { Primitive } from "./Primitive.js";
import { lerp } from "../lerp.js";

/**
 * Circular arc primitive defined as a circle and start and stop angles
 * @implements {Primitive}
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
   * Render a partial arc, t percent from the
   * way from the start angle to the end angle
   * @param {number} t T value in [0, 1]
   * @return {Primitive}
   */
  render_partial(t) {
    const interpolated_angles = new ArcAngles(this.angles.start_angle, 
      lerp(this.angles.start_angle, this.angles.end_angle, t)
    )
    return new ArcPrimitive(
      this.center,
      this.radius,
      interpolated_angles
    )
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
}
