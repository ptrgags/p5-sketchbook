import { griderator } from "../sketchlib/Grid.js";

// How many triangle tiles I made SVG files for
const TILE_COUNT = 14;
// Size of a single tile.
const TILE_SIZE = 125;
const CANVAS_SIZE_TILES = 4;

const OFFSET_Y = (700 - TILE_SIZE * CANVAS_SIZE_TILES) / 2;

const TILES = Array(TILE_COUNT);

/**
 * Do nothing to the axes. This function
 * isn't necessary, but it completes the symmetry
 */
function identity() {
  // nothing to do here :)
}

/**
 * Translate and flip the axes horizontally
 * within the current tile
 */
function flip_x(p) {
  p.translate(TILE_SIZE, 0);
  p.scale(-1, 1);
}

/**
 * Translate and flip the axes vertically
 * within the current tile
 */
function flip_y(p) {
  p.translate(0, TILE_SIZE);
  p.scale(1, -1);
}

/**
 * Translate and flip the axes so the
 * tile has been rotated 180 degrees
 */
function flip_xy(p) {
  p.translate(TILE_SIZE, TILE_SIZE);
  p.scale(-1, -1);
}

/**
 * Draw a single square tile, composed of 2 smaller
 * triangle tiles
 *
 * type 0  type 1
 *
 *    1     0
 * _____   _____
 * |\  |   |  /|
 * | \ |   | / |
 * |__\|   |/__|
 *  0         1
 *
 * @param {p5} p The p5 sketch
 * @param {Number} row Integer row number
 * @param {Number} column Integer column number
 * @param {Number} tile1 Index into the TILES array
 * @param {Number} tile2 Second tile
 */
function draw_tile(p, row, column, tile1, tile2) {
  const tile_type = (row + column) % 2;

  p.push();
  p.translate(column * TILE_SIZE, row * TILE_SIZE);

  p.push();
  if (tile_type === 0) {
    identity(p);
  } else {
    flip_y(p);
  }
  p.image(TILES[tile1], 0, 0, TILE_SIZE, TILE_SIZE);
  p.pop();

  p.push();
  if (tile_type === 0) {
    flip_xy(p);
  } else {
    flip_x(p);
  }
  p.image(TILES[tile2], 0, 0, TILE_SIZE, TILE_SIZE);
  p.pop();

  p.pop();
}

export const sketch = (p) => {
  p.preload = () => {
    for (let i = 0; i < TILE_COUNT; i++) {
      TILES[i] = p.loadImage(`tiles/triangle-tile${i + 1}.svg`);
    }
  };

  p.setup = () => {
    p.createCanvas(500, 700);
    p.background(200);

    // The image is square, but I want to fit it into a trading card frame.
    // The square will fill the horizontal width, but I need to center it
    // vertically.
    p.push();
    p.translate(0, OFFSET_Y);

    griderator(CANVAS_SIZE_TILES, CANVAS_SIZE_TILES, (i, j) => {
      // Draw the tile bounds
      p.stroke(255);
      p.noFill();
      p.rect(
        i * TILE_SIZE + 1,
        j * TILE_SIZE + 1,
        TILE_SIZE - 2,
        TILE_SIZE - 2
      );

      if ((i + j) % 2 == 0) {
        p.line(
          i * TILE_SIZE,
          j * TILE_SIZE,
          (i + 1) * TILE_SIZE,
          (j + 1) * TILE_SIZE
        );
      } else {
        p.line(
          (i + 1) * TILE_SIZE,
          j * TILE_SIZE,
          i * TILE_SIZE,
          (j + 1) * TILE_SIZE
        );
      }
    });

    griderator(CANVAS_SIZE_TILES, CANVAS_SIZE_TILES, (i, j) => {
      const tile1 = p.floor(p.random(TILE_COUNT));
      const tile2 = p.floor(p.random(TILE_COUNT));
      draw_tile(p, i, j, tile1, tile2);
    });

    p.pop();
  };
};
