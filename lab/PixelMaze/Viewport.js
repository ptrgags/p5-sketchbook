import { Point } from "../../pga2d/objects.js";
import { Sprite } from "./Sprite.js";

/**
 * Return the middle vlaue of three, regardless of the order of the input.
 * This is like clamp() except it works even if the arguments are permuted!
 * @param {number} a The first value
 * @param {number} b The first value
 * @param {number} c The second value
 * @returns {number} the median
 */
function median(a, b, c) {
  const m = Math.min(b, c);
  const M = Math.max(b, c);
  return Math.min(Math.max(a, m), M);
}

/**
 * Compute the component-wise median
 * @param {Point} a the first direction
 * @param {Point} b the second direction
 * @param {Point} c the third direction
 * @returns {Point} A direction where each component is the median of the three respective versions of that coordinate
 */
function median_point(a, b, c) {
  const med_x = median(a.x, b.x, c.x);
  const med_y = median(a.y, b.y, c.y);
  return new Point(med_x, med_y);
}

export class Viewport {
  /**
   * Constructor
   * @param {Point} position Position of the top left corner of the viewport in pixels of the map (not the screen!)
   * @param {Point} screen_dimensions Screen dimensions. This will determine the side of the viewport
   * @param {Point} margin Margin around a sprite for use with track_sprite()
   * @param {number} upscale_factor Pixel art upscale factor (integer)
   */
  constructor(position, screen_dimensions, margin, upscale_factor) {
    this.position = position;
    this.dimensions = screen_dimensions.scale(1 / upscale_factor);
    this.margin = margin;
    this.upscale_factor = upscale_factor;
  }

  /**
   * Move the viewport so a particular sprite is in frame
   * @param {Point} sprite_position Position of the sprite's origin in pixels of the map (not the screen!)
   * @param {Sprite} sprite the sprite to get information about its origin and dimensions
   */
  track_sprite(sprite_position, sprite) {
    // corners of the sprite in map pixels
    const sprite_top_left = sprite_position.sub(sprite.origin);
    const sprite_bottom_right = sprite_top_left.add(sprite.frame_size);

    // Constrain the viewport so there's at least the margin in all direction.
    // In each dimension, there are three possible places the viewport, and
    // we want the one in the middle.
    const candidate_top_left = sprite_top_left.sub(this.margin);
    const candidate_unchanged = this.position;
    const candidate_bottom_right = sprite_bottom_right
      .add(this.margin)
      .sub(this.dimensions);
    this.position = median_point(
      candidate_top_left,
      candidate_unchanged,
      candidate_bottom_right
    );
  }

  /**
   *
   * @param {Point} point Point in map pixels
   * @returns {Point} A point in map pixels, rounded to nearest pixel to avoid
   * seams when rendering
   */
  map_to_viewport(point) {
    const { x, y } = point.sub(this.position);
    return new Point(Math.round(x), Math.round(y));
  }

  /**
   * Convert map coordinates to screen coordinates
   * @param {Point} point The point in map pixels
   * @returns {Point} The point in screen pixels. This is rounded to the nearest
   * integer to avoid seams when rendered
   */
  map_to_screen(point) {
    const { x, y } = point.sub(this.position).scale(this.upscale_factor);
    return new Point(Math.round(x), Math.round(y));
  }
}
