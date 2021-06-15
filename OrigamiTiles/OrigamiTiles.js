const TILE_COUNT = 14;
const TILE_SIZE = 200;
const CANVAS_SIZE_TILES = 4;

let TILES = Array(TILE_COUNT);

function preload() {
  for (let i = 0; i < TILE_COUNT; i++) {
    TILES[i] = loadImage(`tiles/triangle-tile${i+1}.svg`);
  }
}

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
function flip_x() {
  translate(TILE_SIZE, 0);
  scale(-1, 1);
}

/**
 * Translate and flip the axes vertically
 * within the current tile
 */
function flip_y() {
  translate(0, TILE_SIZE);
  scale(1, -1);
}

/**
 * Translate and flip the axes so the
 * tile has been rotated 180 degrees
 */
function flip_xy() {
  translate(TILE_SIZE, TILE_SIZE);
  scale(-1, -1);
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
 * @param {Number} row Integer row number
 * @param {Number} column Integer column number
 * @param {Number} tile1 Index into the TILES array
 */
function draw_tile(row, column, tile1, tile2) {
  const tile_type = (row + column) % 2;
  
  push();
    translate(column * TILE_SIZE, row * TILE_SIZE);
  
    push();
    if (tile_type === 0) {
      identity();
    } else {
      flip_y();
    }
    image(TILES[tile1], 0, 0, TILE_SIZE, TILE_SIZE);
    pop();
    
    push();
    if (tile_type === 0) {
      flip_xy();
    } else {
      flip_x();
    }
    image(TILES[tile2], 0, 0, TILE_SIZE, TILE_SIZE);
    pop();
  
  pop();
}


function setup() {
  createCanvas(CANVAS_SIZE_TILES * TILE_SIZE, CANVAS_SIZE_TILES * TILE_SIZE);
  background(200);
  
  for (let i = 0; i < CANVAS_SIZE_TILES; i++) {
    for (let j = 0; j < CANVAS_SIZE_TILES; j++) {
      // Draw the tile bounds
      stroke(255);
      noFill();
      rect(i * TILE_SIZE + 1, j * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }
  }
  
  for (let i = 0; i < CANVAS_SIZE_TILES; i++) {
    for (let j = 0; j < CANVAS_SIZE_TILES; j++) {
      const tile1 = floor(random(TILE_COUNT));
      const tile2 = floor(random(TILE_COUNT));
      draw_tile(i, j, tile1, tile2); 
    }
  }
}
