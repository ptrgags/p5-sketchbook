import { Point } from "../../pga2d/objects.js";
import { ArcAngles } from "../../sketchlib/ArcAngles.js";
import { Color } from "../../sketchlib/Color.js";
import { GroupPrimitive } from "../../sketchlib/rendering/GroupPrimitive.js";
import { ArcPrimitive, LinePrimitive } from "../../sketchlib/rendering/primitives.js";
import { group, style } from "../../sketchlib/rendering/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { Tween } from "../../sketchlib/Tween.js";

// TODO: this should not be used in this class!
const PIXELS_PER_METER = 100;

// TODO: should this be a part of the arc, or should it be passed in by
// caller?
const GREY_LINES = new Style({
  stroke: Color.from_hex_code("#333333"),
  width: 4,
});
const RED_LINES = new Style({
  stroke: Color.RED,
  width: 4,
});

export class AnimatedArc {
  /**
   * Constructor
   * @param {Point} center Center of the circle this arc lives on in screen space
   * @param {number} radius Radius of the circle this arc lives on in screen space
   * @param {ArcAngles} angles The angles for the full circular arc
   * @param {number} start_frame Start frame of the animation
   * @param {number} duration Duration of the animation in frames
   */
  constructor(center, radius, angles, start_frame, duration) {
    this.center = center;
    this.radius = radius;
    this.angles = angles;
    this.arc_primitive = new ArcPrimitive(center, radius, angles);
    this.line_primitive = new LinePrimitive(
      center.add(
        Point.dir_from_angle(-angles.start_angle).scale(PIXELS_PER_METER)
      ),
      center.add(
        Point.dir_from_angle(-angles.end_angle).scale(PIXELS_PER_METER)
      )
    );
    this.full_primitive = style(this.arc_primitive, GREY_LINES);
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
    // Flip angle so it's measured CCW
    const direction = Point.dir_from_angle(-angle);
    return this.center.add(direction.scale(PIXELS_PER_METER));
  }

  /**
   * Render an arc accurate for this frame
   * @param {number} frame Frame count
   * @returns {GroupPrimitive} A primitive to draw
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

    // Draw the full primitive in grey, with the partial arc on top in red.
    const styled_arc = style(partial_arc, RED_LINES);
    return group(this.full_primitive, styled_arc);
  }
}