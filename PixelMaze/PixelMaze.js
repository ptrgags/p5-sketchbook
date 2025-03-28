import { Point } from "../pga2d/objects.js";

const TILE_SIZE = 16;
const TILE_SCALE = 2;

class Tileset {
  /**
   *
   * @param {any} image p5.Image instance
   * @param {number} tile_size Width of a single square tile
   */
  constructor(image, tile_size) {
    if (image.width % tile_size !== 0 || image.height % tile_size !== 0) {
      throw new Error("image must be divisible by tile_size");
    }
    this.image = image;
    this.tile_size = tile_size;
    this.grid_dims = Point.direction(
      image.width / tile_size,
      image.height / tile_size
    );
  }

  /**
   * Get the pixel coordinates within the tileset for the top left corner
   * of the specified tile
   * @param {number} tile_id The frame number
   * @returns {Point} The coordinates for this frame
   */
  get_coords(tile_id) {
    const width = this.grid_dims.x;
    const x = tile_id % width;
    const y = Math.floor(tile_id / width);
    return Point.point(x * this.tile_size, y * this.tile_size);
  }
}

/**
 * Low-level tile drawing function
 * @param {any} p p5 instance
 * @param {Tileset} tileset the spritesheet to reference
 * @param {number} frame_id The frame in the sprite
 * @param {Point} dst_pos The position on the screen to display the sprite
 * @param {number} scale the scale factor for drawing on the screen
 */
function blit_tile(p, tileset, frame_id, dst_pos, scale) {
  const dst_size = scale * tileset.tile_size;
  const src_pos = tileset.get_coords(frame_id);
  const src_size = tileset.tile_size;
  p.image(
    tileset.image,
    dst_pos.x,
    dst_pos.y,
    dst_size,
    dst_size,
    src_pos.x,
    src_pos.y,
    src_size,
    src_size
  );
}

class Spritesheet {
  /**
   * Constructor
   * @param {any} image p5.Image instance
   * @param {Point} frame_size Frame size as a direction
   */
  constructor(image, frame_size) {
    const { x, y } = frame_size;
    if (image.width % x !== 0 || image.height % y !== 0) {
      throw new Error(
        "image must be divisible by frame_dimensions in both dimensions"
      );
    }

    this.image = image;
    this.frame_size = frame_size;
    this.grid_dims = Point.direction(image.width / x, image.height / y);
  }

  /**
   * Get the pixel coordinates within the spritesheet for the top left corner
   * of the specified frame
   * @param {number} frame_id The frame number
   * @returns {Point} The frame
   */
  get_coords(frame_id) {
    const width = this.grid_dims.x;
    const x = frame_id % width;
    const y = Math.floor(frame_id / width);
    return Point.point(x * this.frame_size.x, y * this.frame_size.y);
  }
}

/**
 * Low-level sprite drawing function
 * @param {any} p p5 instance
 * @param {Spritesheet} spritesheet the spritesheet to reference
 * @param {number} frame_id The frame in the sprite
 * @param {Point} dst_pos The position on the screen to display the sprite
 * @param {number} scale the scale factor for drawing on the screen
 */
function blit_sprite_frame(p, spritesheet, frame_id, dst_pos, scale) {
  const dst_dims = spritesheet.frame_size.scale(scale);
  const src_pos = spritesheet.get_coords(frame_id);
  const src_dims = spritesheet.frame_size;
  p.image(
    spritesheet.image,
    dst_pos.x,
    dst_pos.y,
    dst_dims.x,
    dst_dims.y,
    src_pos.x,
    src_pos.y,
    src_dims.x,
    src_dims.y
  );
}

export const sketch = (p) => {
  let canvas;
  const images = {};
  const tilesets = {};
  const spritesheets = {};

  p.preload = () => {
    images.tileset = p.loadImage("./sprites/placeholder-tileset.png");
    images.walk_cycle = p.loadImage("./sprites/placeholder-walk-cycle.png");
  };

  p.setup = () => {
    canvas = p.createCanvas(500, 700).elt;

    tilesets.basic = new Tileset(images.tileset, TILE_SIZE);
    spritesheets.walk = new Spritesheet(
      images.walk_cycle,
      Point.direction(TILE_SIZE, 2 * TILE_SIZE)
    );

    p.noSmooth();
  };

  p.draw = () => {
    p.background(0);

    blit_tile(p, tilesets.basic, 0, Point.point(0, 0), TILE_SCALE);
    blit_tile(
      p,
      tilesets.basic,
      1,
      Point.point(0, TILE_SCALE * TILE_SIZE),
      TILE_SCALE
    );
    blit_tile(
      p,
      tilesets.basic,
      2,
      Point.point(0, 2 * TILE_SCALE * TILE_SIZE),
      TILE_SCALE
    );

    blit_sprite_frame(
      p,
      spritesheets.walk,
      Math.floor(p.frameCount / 3.5) % 4,
      Point.point(4 * TILE_SIZE, 3 * TILE_SIZE),
      TILE_SCALE
    );
  };
};
