import { Index2D } from "../Grid.js";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Primitive } from "../primitives/Primitive.js";

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
   * @param {number} [frame_id=0] ID of the current frame that will be rendered
   * on draw
   */
  constructor(spritesheet, frame_size, position, frame_id = 0) {
    this.spritesheet = spritesheet;
    this.frame_size = frame_size;
    this.position = position;
    this.frame_id = frame_id;
  }

  /**
   * Draw the currently selected frame to the screen
   * @param {import("p5")} p
   */
  draw(p) {
    // @ts-ignore
    const spritesheet_width = this.spritesheet.width;
    const cols = spritesheet_width / this.frame_size.x;

    const col = this.frame_id % cols;
    const row = Math.floor(this.frame_id / cols);

    const src_x = col * this.frame_size.x;
    const src_y = row * this.frame_size.y;
    const { x: src_width, y: src_height } = this.frame_size;

    const { x: dst_x, y: dst_y } = this.position;
    const { x: dst_width, y: dst_height } = this.frame_size;

    // @ts-ignore
    p.image(
      this.spritesheet,
      dst_x,
      dst_y,
      dst_width,
      dst_height,
      src_x,
      src_y,
      src_width,
      src_height,
    );
  }
}
