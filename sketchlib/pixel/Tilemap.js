import { Index2D } from "../Grid.js";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Primitive } from "../primitives/Primitive.js";
import { ImageFrames } from "./ImageFrames.js";

/**
 * A tilemap lets you copy and paste tiles from a tileset into a buffer.
 *
 * When drawn as a Primitive, the whole buffer is drawn to the screen
 * @implements {Primitive}
 */
export class Tilemap {
  /**
   * Constructor
   * @param {import("p5")} p p5 instance for allocating resources
   * @param {import("p5").Image} tileset Image with the tiles
   * @param {Direction} tile_size How big is each tile
   * @param {Direction} map_size How many tiles wide/tall is the map?
   * @param {Point} position Position on the screen to
   */
  constructor(p, tileset, tile_size, map_size, position) {
    this.tileset = tileset;

    // @ts-ignore
    const tileset_dimensions = new Direction(tileset.width, tileset.height);
    this.tileset_frames = new ImageFrames(tileset_dimensions, tile_size);

    const map_dimensions = tile_size.mul_components(map_size);
    this.map_frames = new ImageFrames(map_dimensions, tile_size);
    this.map_gfx = p.createGraphics(map_dimensions.x, map_dimensions.y);

    this.position = position;
  }

  /**
   * Paste a single tile into the buffer
   *
   * Notably, this always draws on top of the grid cell, it does not erase
   * any pixels. This allows for layering tiles without needing a separate
   * tilemap. Though this requires some care to render in the correct order.
   * @param {Index2D} coords (row, col) coordinates of the tile
   * @param {number} tile_index The tile number within the tileset
   */
  blit_tile(coords, tile_index) {
    const dst_frame = this.map_frames.get_frame_2d(coords);
    const { position: dst_position, dimensions } = dst_frame;

    const src_frame = this.tileset_frames.get_frame(tile_index);
    const { position: src_position } = src_frame;

    this.map_gfx.image(
      this.tileset,
      dst_position.x,
      dst_position.y,
      dimensions.x,
      dimensions.y,
      src_position.x,
      src_position.y,
      dimensions.x,
      dimensions.y,
    );
  }

  /**
   * Draw the tileset to the screen
   * @param {import("p5")} p
   */
  draw(p) {
    p.image(this.map_gfx, this.position.x, this.position.y);
  }
}
