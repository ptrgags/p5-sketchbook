import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";
import { in_bounds } from "../sketchlib/in_bounds.js";
import { PentagGrid } from "./PentagGrid.js";
import { PentagArcType } from "./PentagCell.js";
import { PentagIndex } from "./PentagIndex.js";

/**
 * An artistic tiling using pentagons. Not regular pentagons, but
 * a square + triangle, like some luggage/shopping tags.
 *
 * ...like this:
 *
 *  _____           _____
 * |     \_________/     |
 * |_____/    |    \_____| ...
 * |     \____|____/     |
 * |_____/    |    \_____|
 *       \____|____/
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

function get_pentag_point(index) {
  const { row, col } = index;
  const column_quad = Math.floor(col / 4);
  const OFFSETS = [3, 2, 8, 7];
  const x = column_quad * 10 + OFFSETS[col % 4];

  // For every four columns, the second and third ones need to be
  // shifted one square vertically
  const y = 2 * row + Number(index.is_staggered) + 1;

  return [x, y];
}

function draw_pentag_cell(p, index) {
  const [x, y] = get_pentag_point(index);
  draw_pentag(p, x * SQUARE_SIZE, y * SQUARE_SIZE, index.is_flipped);
}

function draw_dot(p, index, radius) {
  const [x, y] = get_pentag_point(index);
  const x_direction = index.is_flipped ? -1.0 : 1.0;

  const cx = (x - 1.5 * x_direction) * SQUARE_SIZE;
  const cy = y * SQUARE_SIZE;
  p.circle(cx, cy, 2 * radius);
}

function draw_pentag_arcs(p, index, arc_enabled) {
  const [x, y] = get_pentag_point(index);
  const x_direction = index.is_flipped ? -1.0 : 1.0;

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
  if (arc_enabled[PentagArcType.TOP_DIAG_AND_TOP]) {
    p.bezier(...midpoints[0], ...centers[1], ...centers[0], ...midpoints[1]);
  }

  // Arc 1: Between top and vertical side
  if (arc_enabled[PentagArcType.TOP_AND_VERTICAL]) {
    p.bezier(...midpoints[1], ...centers[0], ...centers[0], ...midpoints[2]);
  }

  // Arc 2: Between flat side and bottom
  if (arc_enabled[PentagArcType.VERTICAL_AND_BOTTOM]) {
    p.bezier(...midpoints[2], ...centers[0], ...centers[0], ...midpoints[3]);
  }

  // Arc 3: Between bottom and bottom diagonal
  if (arc_enabled[PentagArcType.BOTTOM_AND_BOTTOM_DIAG]) {
    p.bezier(...midpoints[3], ...centers[0], ...centers[1], ...midpoints[4]);
  }

  // Arc 4: Between diagonals
  if (arc_enabled[PentagArcType.BOTTOM_DIAG_AND_TOP_DIAG]) {
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

  // To determine the row, we first need to check if the
  const is_staggered = new PentagIndex(0, col).is_staggered;

  const row = is_staggered
    ? Math.floor((grid_row - 1) / 2)
    : Math.floor(grid_row / 2);

  // The tiles in the offset columns at the edge of the screen are a bit
  // cropped, so ignore them.
  if (is_staggered && (row < 0 || row >= ROWS - 1)) {
    return undefined;
  }

  return new PentagIndex(row, 4 * half + col);
}

function can_select(state, index) {
  for (const grid of state.grids) {
    const cell = grid.get_cell(index);
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
  let canvas;
  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;
  };

  p.draw = () => {
    p.background(0);

    // Draw the pentag grid
    // Color theme taken from https://lospec.com/palette-list/cthulhu-16
    p.stroke(59, 66, 81); // dark blue
    p.strokeWeight(2);
    p.fill(82, 123, 146); // pale dark blue
    for (const cell of state.grids[0]) {
      draw_pentag_cell(p, cell.index);
    }

    // Highlight the cell the mouse is hovered over
    p.fill(199, 255, 243); // light blue
    const mouse_cell = state.mouse_cell;
    if (mouse_cell) {
      if (can_select(state, mouse_cell)) {
        draw_pentag_cell(p, mouse_cell);
      }
    }

    // Draw the first layer of arcs/dots in sea green
    p.noFill();
    p.stroke(165, 229, 197);
    p.strokeWeight(15);
    p.strokeCap(p.SQUARE);
    for (const cell of state.grids[0]) {
      if (cell.is_selectable) {
        draw_dot(p, cell.index, 0.25 * SQUARE_SIZE);
      } else {
        draw_pentag_arcs(p, cell.index, cell.arc_display_flags);
      }
    }

    //Draw the second layer of arcs/dots in brown
    p.noFill();
    p.stroke(133, 71, 49);
    p.strokeWeight(4);
    for (const cell of state.grids[1]) {
      if (cell.is_selectable) {
        draw_dot(p, cell.index, 0.125 * SQUARE_SIZE);
      } else {
        draw_pentag_arcs(p, cell.index, cell.arc_display_flags);
      }
    }
  };

  p.mouseMoved = () => {
    // p5.js doesn't account for my CSS that scales the canvas while keeping
    // aspect ratio
    const { x, y } = fix_mouse_coords(canvas, p.mouseX, p.mouseY);

    if (!in_bounds(x, y, WIDTH, HEIGHT)) {
      state.mouse_cell = undefined;
      return true;
    }

    state.mouse_cell = find_cell(x, y);

    return false;
  };

  p.mouseReleased = () => {
    // p5.js doesn't account for my CSS that scales the canvas while keeping
    // aspect ratio
    const { x, y } = fix_mouse_coords(canvas, p.mouseX, p.mouseY);

    if (!in_bounds(x, y, WIDTH, HEIGHT)) {
      return true;
    }

    const mouse_cell = find_cell(x, y);
    if (mouse_cell) {
      for (const grid of state.grids) {
        grid.select(mouse_cell);
      }
    }

    return false;
  };
};
