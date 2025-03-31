import { Point } from "../pga2d/objects.js";
import { mod } from "../sketchlib/mod.js";
import { ImageFrames } from "./ImageFrames.js";

/**
 * A contiguous strip of frames from an ImageFrames, used as an animation.
 * The frames are considered to wrap at the end of the row
 */
export class Sprite {
  /**
   * Constructor
   * @param {ImageFrames} spritesheet The layout of the sprite sheet
   * @param {number} start_frame The frame ID of the first frame in the animation
   * @param {number} frame_count How many frames in the animation (must be positive)
   * @param {Point} origin Origin of the sprite as a direction in pixels
   */
  constructor(spritesheet, start_frame, frame_count, origin) {
    if (frame_count < 1) {
      throw new Error("frame_count must be positive");
    }

    const min_frame = 0;
    const max_frame = spritesheet.frame_count;

    if (start_frame < min_frame || start_frame >= max_frame) {
      throw new Error(
        `start frame out of bounds, must be in [${min_frame}, ${max_frame})`
      );
    }

    const end_frame = start_frame + frame_count;
    if (end_frame < min_frame || end_frame > max_frame) {
      throw new Error(`animation too long, image has only ${max_frame} frames`);
    }
    this.frames = spritesheet;
    this.start_frame = start_frame;
    this.frame_count = frame_count;
    this.origin = origin;
  }

  /**
   * Get the frame ID for a given animation time
   * @param {number} t The animation time measured in frames since start of the animation
   * @returns {number} The integer frame ID
   */
  get_frame_id(t) {
    const offset = mod(Math.floor(t), this.frame_count);
    return this.start_frame + offset;
  }

  /**
   * Convenience constructor for pulling out a contiguous strip of frames
   * from a row of the sprite sheet
   * @param {ImageFrames} image_frames The image frames to use
   * @param {number} row The row number
   * @param {number} frame_count The number of frames in the animation
   * @param {Point} origin
   * @returns {Sprite} A sprite animation from these frames
   */
  static from_row(image_frames, row, frame_count, origin) {
    const start_frame = row * image_frames.grid_dimensions.x;
    return new Sprite(image_frames, start_frame, frame_count, origin);
  }

  /**
   * Convenience constructor - Characters often have 4 versions of each
   * animation for the 4 cardinal directions. If each animation is a row
   * in the spritesheet, the rows are contiguous and ordered in the same order
   * as the GridDirection enum, then the math for extracting the animations
   * is nice and straightforward
   * @param {ImageFrames} image_frames The image frames
   * @param {number} start_row The row number of the first image strip
   * @param {number} frame_count The number of frames in the animation for one direction
   * @param {Point} origin The origin
   * @returns {Sprite[]} An array of 4 sprites that can be indexed by a GridDirection
   */
  static make_direction_sprites(image_frames, start_row, frame_count, origin) {
    const right = Sprite.from_row(image_frames, start_row, frame_count, origin);
    const up = Sprite.from_row(
      image_frames,
      start_row + 1,
      frame_count,
      origin
    );
    const left = Sprite.from_row(
      image_frames,
      start_row + 2,
      frame_count,
      origin
    );
    const down = Sprite.from_row(
      image_frames,
      start_row + 3,
      frame_count,
      origin
    );
    return [right, up, left, down];
  }
}
