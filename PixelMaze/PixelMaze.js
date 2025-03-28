import { Point } from "../pga2d/objects.js";
import { Grid, Index2D } from "../sketchlib/Grid.js";
import { GridDirection } from "../sketchlib/GridDiection.js";
import { mod } from "../sketchlib/mod.js";
import { generate_maze } from "../sketchlib/RandomDFSMaze.js";

const TILE_SIZE = 16;
const TILE_SCALE = 2;

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
    this.frame_count = this.grid_dims.x * this.grid_dims.y;
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

/**
 * A Sprite is an animation of one or more frames taken from a spritesheet.
 * This doesn't handle any timing information, just the frames and looping.
 */
class Sprite {
  /**
   * Constructor
   * @param {Spritesheet} spritesheet The sprite sheet
   * @param {number} start_frame The first frame in the animation
   * @param {number} frame_count The number of frames in the animation
   * @param {Point} offset A point
   */
  constructor(spritesheet, start_frame, frame_count, offset) {
    this.spritesheet = spritesheet;
    this.start_frame = start_frame;
    this.frame_count = frame_count;
    this.offset = offset;
  }

  /**
   * Get the frame number for a given time value. This floors the t value
   * and cycles at the end of the animation
   * @param {number} t A real number animation time measured in animation frames
   * @returns {number} The integer frame number in range
   */
  get_frame(t) {
    const offset = mod(Math.floor(t), this.frame_count);
    return this.start_frame + offset;
  }

  static from_row(spritesheet, row, frame_count, offset) {
    const start_frame = row * spritesheet.grid_dims.x;
    return new Sprite(spritesheet, start_frame, frame_count, offset);
  }
}

/**
 * Draw the sprite on the screen
 * @param {any} p p5 drawing context
 * @param {Sprite} sprite The sprite to draw
 * @param {number} animation_time The time value to use for selecting a sprite frame
 * @param {Point} position The point on the screen to draw the sprite's origin
 * @param {number} scale Upscale factor
 */
function blit_sprite(p, sprite, animation_time, position, scale) {
  const spritesheet = sprite.spritesheet;
  const frame_id = sprite.get_frame(animation_time);

  blit_sprite_frame(p, spritesheet, frame_id, position, scale);
}

/**
 * Given a spritesheet containing 4 rows (one for each of the cardinal directions)
 * create sprites in the same order as GridDirection
 * @param {Spritesheet} spritesheet The spritesheet
 * @param {number} start_row The first row of the character animation
 * @param {number} frame_count The number of frames in each animation
 * @param {Point} origin The origin for each sprite animation
 * @returns {Sprite[]} An array of 4 sprites that can be indexed by a GridDirection
 */
function make_cardinal_direction_sprites(
  spritesheet,
  start_row,
  frame_count,
  origin
) {
  const right = Sprite.from_row(spritesheet, start_row, frame_count, origin);
  const up = Sprite.from_row(spritesheet, start_row + 1, frame_count, origin);
  const left = Sprite.from_row(spritesheet, start_row + 2, frame_count, origin);
  const down = Sprite.from_row(spritesheet, start_row + 3, frame_count, origin);
  return [right, up, left, down];
}

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

const MAZE_ROWS = 4;
const MAZE_COLS = 3;
const MAZE = generate_maze(MAZE_ROWS, MAZE_COLS);

const Tiles = {
  CEILING: 0,
  WALL: 1,
  FLOOR: 2,
};

const INDICES = new Grid(3 * (2 * MAZE_ROWS - 1), 3 * (2 * MAZE_COLS - 1));
INDICES.fill(() => Tiles.CEILING);

MAZE.for_each((index, cell) => {
  const { i: cell_y, j: cell_x } = index;

  // In the output grid, each input grid cell is 3 cells wide, + another 3
  // for the corridor between each cell
  const row_offset = 6 * cell_y;
  const col_offset = 6 * cell_x;

  // First, we need to add a 3x3 chunk of floor tiles for this cell
  for (let i = 0; i < 3; i++) {
    const dst_row = row_offset + i;
    for (let j = 0; j < 3; j++) {
      const dst_col = col_offset + j;
      INDICES.set(new Index2D(dst_row, dst_col), Tiles.FLOOR);
    }
  }

  // If we're connected on the right, draw a corridor. 3 floor tiles, and
  // 6 wall tiles above it
  if (cell.is_connected(GridDirection.RIGHT)) {
    // Middle of the 3 tiles, hence + 1
    const dst_row = row_offset + 1;
    for (let i = 0; i < 3; i++) {
      const dst_col = col_offset + 3 + i;

      // Draw one floor tile
      const floor_index = new Index2D(dst_row, dst_col);
      INDICES.set(floor_index, Tiles.FLOOR);

      // The two tiles above it are the wall. Since the corridor is in the
      // middle, the bottom of the wall will always fit in the grid, but the
      // top might be cropped a bit.
      const wall_bottom = floor_index.up();
      INDICES.set(wall_bottom, Tiles.WALL);

      const wall_top = wall_bottom.up();
      if (wall_top) {
        INDICES.set(wall_top, Tiles.WALL);
      }
    }
  }

  // The vertical corridors are similar, except the walls are placed a bit
  // differently
  if (cell.is_connected(GridDirection.DOWN)) {
    const dst_col = col_offset + 1;
    for (let i = 0; i < 3; i++) {
      const dst_row = row_offset + 3 + i;

      const floor_index = new Index2D(dst_row, dst_col);
      INDICES.set(floor_index, Tiles.FLOOR);

      if (i > 0) {
        const left_wall = floor_index.left();
        INDICES.set(left_wall, Tiles.WALL);

        const right_wall = floor_index.right();
        INDICES.set(right_wall, Tiles.WALL);
      }
    }
  }

  // For cells below us, we still need a wall above the room even if there
  // was no connection. Each wall is 2 tiles high, so we write a 2x3 rectangle
  // of cells
  if (cell_y + 1 < MAZE.rows && !cell.is_connected(GridDirection.DOWN)) {
    for (let i = 1; i < 3; i++) {
      const dst_row = row_offset + 3 + i;
      for (let j = 0; j < 3; j++) {
        const dst_col = col_offset + j;
        INDICES.set(new Index2D(dst_row, dst_col), Tiles.WALL);
      }
    }
  }
});

/**
 * Draw a tilemap on the screen
 * @param {any} p p5 context
 * @param {Tilemap} tilemap The tilemap
 * @param {Point} origin The pixel coords of where the top left corner of the grid will appear
 * @param {number} scale The scale factor for upscaling tiles
 */
function blit_tilemap(p, tilemap, origin, scale) {
  const { tileset, indices } = tilemap;
  indices.for_each((index, tile_id) => {
    const { i, j } = index;
    const position = Point.direction(j, i).scale(scale * tileset.tile_size);
    blit_tile(p, tileset, tile_id, origin.add(position), scale);
  });
}

class Tilemap {
  /**
   * Constructor
   * @param {Tileset} tileset The tileset with the image data
   * @param {Grid<number>} indices The tile indices into the tileset
   */
  constructor(tileset, indices) {
    this.tileset = tileset;
    this.indices = indices;
  }
}

export const sketch = (p) => {
  let canvas;
  const images = {};
  const tilesets = {};
  const spritesheets = {};
  const tilemaps = {};
  const sprites = {};
  let current_sprite = undefined;

  p.preload = () => {
    images.tileset = p.loadImage("./sprites/placeholder-tileset.png");
    images.character = p.loadImage("./sprites/placeholder-walk-cycle.png");
  };

  p.setup = () => {
    canvas = p.createCanvas(500, 700).elt;

    tilesets.basic = new Tileset(images.tileset, TILE_SIZE);
    tilemaps.background = new Tilemap(tilesets.basic, INDICES);

    spritesheets.character = new Spritesheet(
      images.character,
      Point.direction(TILE_SIZE, 2 * TILE_SIZE)
    );

    // the character is 2 cells tall, but its origin is at the bottom one
    const BOTTOM_HALF = Point.direction(0, TILE_SIZE);
    const WALK_LENGTH = 4;
    sprites.walk = make_cardinal_direction_sprites(
      spritesheets.character,
      0,
      WALK_LENGTH,
      BOTTOM_HALF
    );

    const IDLE_LENGTH = 2;
    sprites.idle = make_cardinal_direction_sprites(
      spritesheets.character,
      4,
      IDLE_LENGTH,
      BOTTOM_HALF
    );

    current_sprite = sprites.walk[GridDirection.LEFT];

    p.noSmooth();
  };

  p.draw = () => {
    p.background(0);

    blit_tilemap(p, tilemaps.background, Point.ORIGIN, TILE_SCALE);

    const t = p.frameCount / 16.0;

    if (current_sprite) {
      const sprite_pos = Point.point(
        1 * TILE_SCALE * TILE_SIZE,
        6 * TILE_SCALE * TILE_SIZE
      );
      blit_sprite(p, current_sprite, t, sprite_pos, TILE_SCALE);
    }
  };
};
