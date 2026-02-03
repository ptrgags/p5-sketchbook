import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { Tween } from "../sketchlib/Tween.js";

export class PixelSwapPair {
  /**
   * Constructor
   * @param {Style} style_a The style for the source pixel
   * @param {Point} position_a The initial position of the source pixel
   * @param {Style} style_b The style for the destination pixel
   * @param {Point} position_b The initial position of the destination pixel
   * @param {number} start_frame The frame of the start of the animation
   * @param {number} duration_frames The duration of the animation
   * @param {number} pixel_width The width of the oversized pixels in... uh... pixels
   */
  constructor(
    style_a,
    position_a,
    style_b,
    position_b,
    start_frame,
    duration_frames,
    pixel_width,
  ) {
    this.style_a = style_a;
    this.style_b = style_b;
    this.position_a = position_a;
    this.position_b = position_b;
    this.tween_ab = Tween.point(
      this.position_a,
      this.position_b,
      start_frame,
      duration_frames,
    );
    this.tween_ba = Tween.point(
      this.position_b,
      this.position_a,
      start_frame,
      duration_frames,
    );
    this.pixel_dimensions = new Direction(pixel_width, pixel_width);
  }

  /**
   * Check if the animation is done
   * @param {number} frame The current frame number
   * @returns {boolean} true if the animation is done
   */
  is_done(frame) {
    // The tweens have the same duration, we could use either.
    return this.tween_ab.is_done(frame);
  }

  /**
   * Render the pair of pixels animated at the current frame number
   * @param {number} frame The current frame number
   * @returns {GroupPrimitive} a primitive to draw for this frame.
   */
  render(frame) {
    const b_position = this.tween_ba.get_value(frame);
    const a_position = this.tween_ab.get_value(frame);

    const square_b = new RectPrimitive(b_position, this.pixel_dimensions);
    const square_a = new RectPrimitive(a_position, this.pixel_dimensions);

    const group_b = style([square_b], this.style_b);
    const group_a = style([square_a], this.style_a);

    // square b must be rendered before square a so the pixel we want to
    // move is on top.
    return group(group_b, group_a);
  }
}
