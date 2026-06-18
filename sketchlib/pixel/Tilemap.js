import { Index2D } from "../Grid.js";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Primitive } from "../primitives/Primitive.js";

/**
 * @implements {Primitive}
 */
export class Tilemap {
  /**
   * Constructor
   * @param {import("p5")} p
   * @param {import("p5").Image} tileset
   * @param {Direction} tile_size
   * @param {Direction} map_size
   * @param {Point} [position=Point.ORIGIN]
   */
  constructor(p, tileset, tile_size, map_size, position = Point.ORIGIN) {
    this.tileset = tileset;
    this.tile_size = tile_size;
    this.tile_counts = new Direction(
      tileset.width / tile_size.x,
      tileset.height / tile_size.y,
    );

    this.map_size = map_size;
    this.position = position;

    const dimensions = tile_size.mul_components(map_size);
    this.gfx = p.createGraphics(dimensions.x, dimensions.y);
  }

  /**
   *
   * @param {Index2D} coords
   * @param {number} tile_index
   */
  blit_tile(coords, tile_index) {
    const { i, j } = coords;
    const dst_x = j * this.tile_size.x;
    const dst_y = i * this.tile_size.y;

    const row = Math.floor(tile_index / this.tile_counts.x);
    const col = tile_index % this.tile_counts.x;

    const src_x = col * this.tile_size.x;
    const src_y = row * this.tile_size.y;

    this.gfx.image(
      this.tileset,
      dst_x,
      dst_y,
      this.tile_size.x,
      this.tile_size.y,
      src_x,
      src_y,
      this.tile_size.x,
      this.tile_size.y,
    );
  }

  /**
   * Draw the tileset to the screen
   * @param {import("p5")} p
   */
  draw(p) {
    p.image(this.gfx, this.position.x, this.position.y);
  }
}
