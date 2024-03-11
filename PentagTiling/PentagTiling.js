/**
 * An artistic tiling using pentagons. Not regular pentagons, but
 * a square + triangle, like some luggage/shopping tags.
 *
 * ...like this:
 *
 *  ____           _____
 * |    \_________/     |
 * |____/    |    \_____| ...
 * |    \____|____/     |
 * |____/    |    \_____|
 *      \____|____/
 *
 *          ...
 */

const WIDTH = 500;
const HEIGHT = 700;

// Each tile is 3 squares wide by 2 squares tall, but due to the way
// the points of the tags interlock, 4 pentags wide is 10 squares wide, not 12.

const SQUARE_SIZE = WIDTH / 20;
const ROWS = Math.floor(HEIGHT / (2 * SQUARE_SIZE));
const COLS = 8;

function draw_pentag(p, point_x, point_y, flipped) {
  const x_direction = flipped ? -1.0 : 1.0;

  p.beginShape();
  p.vertex(point_x, point_y);
  p.vertex(point_x - x_direction * SQUARE_SIZE, point_y - SQUARE_SIZE);
  p.vertex(point_x - 3 * x_direction * SQUARE_SIZE, point_y - SQUARE_SIZE);
  p.vertex(point_x - 3 * x_direction * SQUARE_SIZE, point_y + SQUARE_SIZE);
  p.vertex(point_x - x_direction * SQUARE_SIZE, point_y + SQUARE_SIZE);

  p.endShape(p.CLOSE);
}

function get_pentag_point(row, col) {
  const column_quad = Math.floor(col / 4);
  const OFFSETS = [3, 2, 8, 7];
  const x = column_quad * 10 + OFFSETS[col % 4];

  // For every four columns, the second and third ones need to be
  // shifted one square vertically
  const offset_y = (col + 3) % 4 < 2;
  const y = 2 * row + Number(offset_y) + 1;

  return [x, y];
}

function draw_pentag_cell(p, row, col) {
  const [x, y] = get_pentag_point(row, col);

  // Every other column is a backwards pentag
  const flipped = col % 2 === 1;

  draw_pentag(p, x * SQUARE_SIZE, y * SQUARE_SIZE, flipped);
}

function draw_pentag_arcs(p, row, col, arc_enabled) {
  const [x, y] = get_pentag_point(row, col);
  const flipped = col % 2 === 1;
  const x_direction = flipped ? -1.0 : 1.0;

  //    ____1____
  //   |         \
  //   |          0
  //   |           \
  //   2            >
  //   |           /
  //   |          4
  //   |____3____/
  const midpoints = [
    [-0.5 * x_direction, -0.5],
    [-2 * x_direction, -1],
    [-3 * x_direction, 0],
    [-2 * x_direction, 1],
    [-0.5 * x_direction, 0.5],
  ].map(([dx, dy]) => [(x + dx) * SQUARE_SIZE, (y + dy) * SQUARE_SIZE]);

  //    _________
  //   |         \
  //   |          \
  //   |           \
  //   |    0   1   >
  //   |           /
  //   |          /
  //   |_________/
  const centers = [
    [-2 * x_direction, 0],
    [-1 * x_direction, 0],
  ].map(([dx, dy]) => [(x + dx) * SQUARE_SIZE, (y + dy) * SQUARE_SIZE]);

  // Arc 0: between the top diagonal and top
  if (arc_enabled[0]) {
    p.bezier(...midpoints[0], ...centers[1], ...centers[0], ...midpoints[1]);
  }

  // Arc 1: Between top and flat side
  if (arc_enabled[1]) {
    p.bezier(...midpoints[1], ...centers[0], ...centers[0], ...midpoints[2]);
  }

  // Arc 2: Between flat side and bottom
  if (arc_enabled[2]) {
    p.bezier(...midpoints[2], ...centers[0], ...centers[0], ...midpoints[3]);
  }

  // Arc 3: Between bottom and bottom diagonal
  if (arc_enabled[3]) {
    p.bezier(...midpoints[3], ...centers[0], ...centers[1], ...midpoints[4]);
  }

  // Arc 4: Between diagonals
  if (arc_enabled[4]) {
    p.bezier(...midpoints[4], ...centers[1], ...centers[1], ...midpoints[0]);
  }
}

function get_arc_flags(tile_type) {
  switch (tile_type) {
    case 0:
      return [true, false, false, true, false];
    case 1:
      return [false, false, true, false, true];
    case 2:
      return [false, true, false, true, false];
    case 3:
      return [true, false, true, false, false];
    case 4:
      return [false, true, false, false, true];
  }

  return undefined;
}

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
  };

  p.draw = () => {
    p.background(0);

    p.stroke(127);
    p.noFill();

    // Draw the pentag grid
    p.stroke(127);
    p.strokeWeight(2);
    p.fill(255);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        // The offset tiles go offscreen a tiny bit, so ignore them.
        if (row === ROWS - 1 && (col + 3) % 4 < 2) {
          continue;
        }

        draw_pentag_cell(p, row, col);
      }
    }

    // Draw all arcs as a warmup
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        // The offset tiles go offscreen a tiny bit, so ignore them.
        if (row === ROWS - 1 && (col + 3) % 4 < 2) {
          continue;
        }

        p.strokeWeight(10);
        p.strokeCap(p.SQUARE);
        draw_pentag_arcs(p, row, col, get_arc_flags(row % 5));
      }
    }
  };
};
