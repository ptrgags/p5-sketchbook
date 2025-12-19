import { Point } from "../pga2d/objects.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { Tween } from "../sketchlib/Tween.js";

/**
 * Class for managing an animated circular arc.
 */
export class AnimatedArc {
  /**
   * Constructor
   * @param {Point} center Center of the circle this arc lives on in screen space
   * @param {number} radius Radius of the circle this arc lives on in screen space
   * @param {ArcAngles} angles The angles for the full circular arc (!!! in p5.js screen space, postive is clockwise !!!)
   * @param {number} start_frame Start frame of the animation
   * @param {number} duration Duration of the animation in frames
   */
  constructor(center, radius, angles, start_frame, duration) {
    this.center = center;
    this.radius = radius;
    this.angles = angles;

    /**
     * The full arc, this is used for the background, and the owning
     * ArcRobot will access this for rendering
     * @type {ArcPrimitive}
     */
    this.arc_primitive = new ArcPrimitive(center, radius, angles);

    /**
     * A line from the start point to the end point, mainly for debugging.
     * @type {LinePrimitive}
     */
    this.line_primitive = new LinePrimitive(
      center.add(Point.dir_from_angle(angles.start_angle).scale(radius)),
      center.add(Point.dir_from_angle(angles.end_angle).scale(radius))
    );

    /**
     * Tween that interpolates the angle of the arc for a given frame
     * @type {Tween}
     */
    this.angle_tween = Tween.scalar(
      angles.start_angle,
      angles.end_angle,
      start_frame,
      duration
    );
  }

  /**
   * Check if the animation is finished
   * @param {number} frame The current frame number
   * @returns {boolean} True if the animation is finished.
   */
  is_done(frame) {
    return this.angle_tween.is_done(frame);
  }

  /**
   * Get the current position on the arc
   * @param {number} frame The current frame number
   * @returns {Point} The current point on the arc
   */
  current_position(frame) {
    const angle = this.angle_tween.get_value(frame);
    const direction = Point.dir_from_angle(angle);
    return this.center.add(direction.scale(this.radius));
  }

  /**
   * Get the local "forward" direction in model space at this frame
   * @param {number} frame The current frame number
   * @returns {Point} The forward direction as a Point.direction
   */
  forward_dir(frame) {
    // The tangent to the curve will always be a quarter turn away from
    // the orientation. However, there are two possible tangents. Choose
    // the one in the direction of the angles.
    const raw_angle = this.angle_tween.get_value(frame);
    let angle;
    if (this.angles.direction === -1) {
      angle = raw_angle - Math.PI / 2;
    } else {
      angle = raw_angle + Math.PI / 2;
    }

    return Point.dir_from_angle(angle);
  }

  /**
   * Render an arc accurate for this frame. If you want to render the
   * full arc to show the trajectory, access this.arc_primitive
   * @param {number} frame Frame count
   * @returns {ArcPrimitive} A primitive to draw
   */
  render(frame) {
    // Compute a partial arc from the start angle to the current value
    // based on the tween.
    const interpolated_angles = new ArcAngles(
      this.angles.start_angle,
      this.angle_tween.get_value(frame)
    );
    const partial_arc = new ArcPrimitive(
      this.center,
      this.radius,
      interpolated_angles
    );
    return partial_arc;
  }
}
