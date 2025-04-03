import { Grid, Index2D } from "../sketchlib/Grid.js";
import { Direction } from "../sketchlib/Direction.js";
import { generate_maze } from "../sketchlib/RandomDFSMaze.js";

/// Simplified version of the maze tileset, just ceilings, walls and floors
const Tiles = {
  CEILING: 0,
  WALL: 1,
  FLOOR: 2,
};

function add_floors_and_walls(maze, indices) {
  maze.for_each((index, cell) => {
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
        indices.set(new Index2D(dst_row, dst_col), Tiles.FLOOR);
      }
    }

    // If we're connected on the right, draw a corridor. 3 floor tiles, and
    // 6 wall tiles above it
    if (cell.is_connected(Direction.RIGHT)) {
      // Middle of the 3 tiles, hence + 1
      const dst_row = row_offset + 1;
      for (let i = 0; i < 3; i++) {
        const dst_col = col_offset + 3 + i;

        // Draw one floor tile
        const floor_index = new Index2D(dst_row, dst_col);
        indices.set(floor_index, Tiles.FLOOR);

        // The two tiles above it are the wall. Since the corridor is in the
        // middle, the bottom of the wall will always fit in the grid, but the
        // top might be cropped a bit.
        const wall_bottom = floor_index.up();
        indices.set(wall_bottom, Tiles.WALL);

        const wall_top = wall_bottom.up();
        if (wall_top) {
          indices.set(wall_top, Tiles.WALL);
        }
      }
    }

    // The vertical corridors are similar, except the walls are placed a bit
    // differently
    if (cell.is_connected(Direction.DOWN)) {
      const dst_col = col_offset + 1;
      for (let i = 0; i < 3; i++) {
        const dst_row = row_offset + 3 + i;

        const floor_index = new Index2D(dst_row, dst_col);
        indices.set(floor_index, Tiles.FLOOR);

        if (i > 0) {
          const left_wall = floor_index.left();
          indices.set(left_wall, Tiles.WALL);

          const right_wall = floor_index.right();
          indices.set(right_wall, Tiles.WALL);
        }
      }
    }

    // For cells below us, we still need a wall above the room even if there
    // was no connection. Each wall is 2 tiles high, so we write a 2x3 rectangle
    // of cells
    if (cell_y + 1 < maze.rows && !cell.is_connected(Direction.DOWN)) {
      for (let i = 1; i < 3; i++) {
        const dst_row = row_offset + 3 + i;
        for (let j = 0; j < 3; j++) {
          const dst_col = col_offset + j;
          indices.set(new Index2D(dst_row, dst_col), Tiles.WALL);
        }
      }
    }
  });
}

const TILES_PER_CELL = 3;

export function make_maze(rows, cols) {
  const maze = generate_maze(rows, cols);
  const indices = new Grid(
    TILES_PER_CELL * (2 * rows - 1),
    TILES_PER_CELL * (2 * cols - 1)
  );
  indices.fill(() => Tiles.CEILING);

  add_floors_and_walls(maze, indices);

  return indices;
}
