import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Primitive } from "../primitives/Primitive.js";
import { ImageFrames } from "./ImageFrames.js";

/**
 * A sprite is an image divided into a grid of equally sized frames, indexed
 * in row-major order.
 *
 * When drawn, only the currently selected frame is rendered.
 * @implements {Primitive}
 */
export class Sprite {
  /**
   * Constructor
   * @param {import("p5").Image} spritesheet Image containing a number of frames
   * @param {Direction} frame_size Size of a single frame
   * @param {Point} position Position of the sprite on the screen
   * @param {number} frame_id ID of the current frame that will be rendered
   * on draw
   * @param {Point} origin The anchor point for positioning the sprite
   */
  constructor(spritesheet, frame_size, position, frame_id, origin) {
    this.spritesheet = spritesheet;

    // @ts-ignore
    const dimensions = new Direction(spritesheet.width, spritesheet.height);
    this.frames = new ImageFrames(dimensions, frame_size);

    this.frame_size = frame_size;
    this.position = position;
    this.frame_id = frame_id;
    this.origin = origin;
  }

  /**
   * Draw the currently selected frame to the screen
   * @param {import("p5")} p
   */
  draw(p) {
    const offset = this.position.sub(this.origin);
    const { x: dst_x, y: dst_y } = offset;

    const frame = this.frames.get_frame(this.frame_id);
    const { position: src_position, dimensions } = frame;

    // @ts-ignore
    p.image(
      this.spritesheet,
      dst_x,
      dst_y,
      dimensions.x,
      dimensions.y,
      src_position.x,
      src_position.y,
      dimensions.x,
      dimensions.y,
    );
  }
}
