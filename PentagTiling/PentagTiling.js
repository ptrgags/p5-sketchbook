import { PentagGrid } from "./PentagGrid.js";

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
  const offset_y = PentagGrid.needs_y_offset(col);
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

function find_cell(x, y) {
  const grid_row = Math.floor(y / SQUARE_SIZE);
  const grid_col = Math.floor(x / SQUARE_SIZE);

  const grid_x = x % SQUARE_SIZE;
  const grid_y = y % SQUARE_SIZE;
  const is_bottom_left = grid_y > grid_x;
  const is_top_left = grid_y < SQUARE_SIZE - 1 - grid_x;

  // The pentag tiling repeats twice horizontally
  const half = Math.floor(grid_col / 10);
  // Column number within this half of the canvas
  const half_col = Math.floor(grid_col % 10);

  let col;
  if (half_col < 2) {
    col = 0;
  } else if (half_col === 2) {
    // Handle where the pentags interlock
    if (grid_row % 2 === 0) {
      col = is_bottom_left ? 0 : 1;
    } else {
      col = is_top_left ? 0 : 1;
    }
  } else if (half_col < 5) {
    col = 1;
  } else if (half_col < 7) {
    col = 2;
  } else if (half_col === 7) {
    // Handle where pentags interlock
    if (grid_row % 2 === 0) {
      col = is_top_left ? 2 : 3;
    } else {
      col = is_bottom_left ? 2 : 3;
    }
  } else {
    col = 3;
  }

  let row;
  if (PentagGrid.needs_y_offset(col)) {
    row = Math.floor((grid_row - 1) / 2);
  } else {
    row = Math.floor(grid_row / 2);
  }

  // The tiles in the offset columns at the edge of the screen are a bit
  // cropped, so ignore them.
  if (PentagGrid.needs_y_offset(col) && (row < 0 || row >= ROWS - 1)) {
    return undefined;
  }

  return [row, 4 * half + col];
}

function can_select(state, row, col) {
  for (const grid of state.grids) {
    const cell = grid.get_cell(row, col);
    if (!cell) {
      // out of bounds, short circuit the whole function
      return false;
    }

    if (cell.is_selectable) {
      return true;
    }
  }

  return false;
}

const state = {
  mouse_cell: undefined,
  grids: [new PentagGrid(ROWS, COLS), new PentagGrid(ROWS, COLS)],
};

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
    for (const cell of state.grids[0]) {
      draw_pentag_cell(p, cell.row, cell.col);
    }

    // Highlight the cell the mouse is hovered over
    p.fill(0, 255, 255);
    if (state.mouse_cell) {
      const [mouse_row, mouse_col] = state.mouse_cell;
      if (can_select(state, mouse_row, mouse_col)) {
        draw_pentag_cell(p, mouse_row, mouse_col);
      }
    }

    // Draw the first layer of arcs thick in a mint green
    p.noFill();
    p.stroke(3, 252, 152);
    p.strokeWeight(15);
    p.strokeCap(p.SQUARE);
    for (const cell of state.grids[0]) {
      draw_pentag_arcs(p, cell.row, cell.col, cell.arc_flags);
    }

    //Draw the second layer of arcs thinner and in orange
    p.noFill();
    p.stroke(255, 89, 0);
    p.strokeWeight(4);
    for (const cell of state.grids[1]) {
      draw_pentag_arcs(p, cell.row, cell.col, cell.arc_flags);
    }
  };

  p.mouseMoved = () => {
    const x = p.mouseX;
    const y = p.mouseY;
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
      state.mouse_cell = undefined;
      return true;
    }

    state.mouse_cell = find_cell(x, y);

    return false;
  };

  p.mouseReleased = () => {
    const x = p.mouseX;
    const y = p.mouseY;
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) {
      return true;
    }

    const mouse_cell = find_cell(x, y);
    if (mouse_cell) {
      for (const grid of state.grids) {
        grid.select(...mouse_cell);
      }
    }

    return false;
  };
};
