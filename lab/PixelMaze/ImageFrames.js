import { Direction } from "../../pga2d/Direction.js";

/**
 * Class for managing frames of a spritesheet or tile
 * This only supports spritesheets/tilesets where all frames are the same size
 * and there's no spacing between frames.
 */
export class ImageFrames {
  /**
   * Constructor
   * @param {Direction} image_dimensions Image dimensions as a direction in pixels
   * @param {Direction} frame_size Size of a single frame in pixels
   */
  constructor(image_dimensions, frame_size) {
    const { x: w, y: h } = image_dimensions;
    const { x: frame_w, y: frame_h } = frame_size;

    if (w % frame_w !== 0 || h % frame_h !== 0) {
      throw new Error(
        "image_dimensions must be divisible by frame_size in both dimensions"
      );
    }

    this.image_dimensions = image_dimensions;
    this.frame_size = frame_size;
    this.grid_dimensions = new Direction(w / frame_w, h / frame_h);
    this.frame_count = this.grid_dimensions.x * this.grid_dimensions.y;
  }

  /**
   * Get the top left corner of a single frame
   * @param {number} frame_id Integer frame ID in [0, this.frame_count)
   * @returns {Direction} The offset of the frame (as a Direction) in pixels
   */
  get_frame_offset(frame_id) {
    const width = this.grid_dimensions.x;
    const x = frame_id % width;
    const y = Math.floor(frame_id / width);
    return new Direction(x * this.frame_size.x, y * this.frame_size.y);
  }
}
