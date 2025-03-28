import { Point } from "../pga2d/objects.js";
import { Grid, Index2D } from "../sketchlib/Grid.js";
import { GridDirection } from "../sketchlib/GridDiection.js";
import { generate_maze } from "../sketchlib/RandomDFSMaze.js";

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

const MAZE_ROWS = 4;
const MAZE_COLS = 3;
const MAZE = generate_maze(MAZE_ROWS, MAZE_COLS);

const Tiles = {
  CEILING: 0,
  WALL: 1,
  FLOOR: 2,
};

const TILEMAP = new Grid(3 * (2 * MAZE_ROWS - 1), 3 * (2 * MAZE_COLS - 1));
TILEMAP.fill(() => Tiles.CEILING);

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
      TILEMAP.set(new Index2D(dst_row, dst_col), Tiles.FLOOR);
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
      TILEMAP.set(floor_index, Tiles.FLOOR);

      // The two tiles above it are the wall. Since the corridor is in the
      // middle, the bottom of the wall will always fit in the grid, but the
      // top might be cropped a bit.
      const wall_bottom = floor_index.up();
      TILEMAP.set(wall_bottom, Tiles.WALL);

      const wall_top = wall_bottom.up();
      if (wall_top) {
        TILEMAP.set(wall_top, Tiles.WALL);
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
      TILEMAP.set(floor_index, Tiles.FLOOR);

      if (i > 0) {
        const left_wall = floor_index.left();
        TILEMAP.set(left_wall, Tiles.WALL);

        const right_wall = floor_index.right();
        TILEMAP.set(right_wall, Tiles.WALL);
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
        TILEMAP.set(new Index2D(dst_row, dst_col), Tiles.WALL);
      }
    }
  }
});

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

    TILEMAP.for_each((index, tile_id) => {
      const { i, j } = index;
      const position = Point.direction(j, i).scale(TILE_SCALE * TILE_SIZE);
      blit_tile(p, tilesets.basic, tile_id, position, TILE_SCALE);
    });

    blit_sprite_frame(
      p,
      spritesheets.walk,
      2 * 4 + (Math.floor(p.frameCount / 3.5) % 4),
      Point.point(1 * TILE_SCALE * TILE_SIZE, 6 * TILE_SCALE * TILE_SIZE),
      TILE_SCALE
    );
  };
};
