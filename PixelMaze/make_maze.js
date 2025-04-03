import { Grid, Index2D } from "../sketchlib/Grid.js";
import { Direction } from "../sketchlib/Direction.js";
import { generate_maze, MazeCell } from "../sketchlib/RandomDFSMaze.js";

/**
 * @enum {number}
 */
export const Tiles = {
  CEILING: 0,
  WALL: 1,
  FLOOR: 2,
};

const TILES_PER_CELL = 3;
const ROOM_STRIDE = 2 * TILES_PER_CELL;

/**
 * Populate the floors and walls
 * @param {Grid<MazeCell>} maze The maze
 * @param {Grid<number>} indices The tilemap indices to populate
 */
function add_floors_and_walls(maze, indices) {
  maze.for_each((index, cell) => {
    const { i: cell_y, j: cell_x } = index;

    // The rooms have a corridor between me. We also have a 1-cell margin
    // for the outermost walls
    const row_offset = TILES_PER_CELL + ROOM_STRIDE * cell_y;
    const col_offset = TILES_PER_CELL + ROOM_STRIDE * cell_x;

    // First, we need to add a 3x3 chunk of floor tiles for this cell
    for (let i = 0; i < TILES_PER_CELL; i++) {
      const dst_row = row_offset + i;
      for (let j = 0; j < TILES_PER_CELL; j++) {
        const dst_col = col_offset + j;
        indices.set(new Index2D(dst_row, dst_col), Tiles.FLOOR);
      }
    }

    // If we're connected on the right, draw a corridor. 3 floor tiles, and
    // 6 wall tiles above it
    if (cell.is_connected(Direction.RIGHT)) {
      // Middle of the 3 tiles, hence + 1
      const dst_row = row_offset + 1;
      for (let i = 0; i < TILES_PER_CELL; i++) {
        const dst_col = col_offset + TILES_PER_CELL + i;

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
      for (let i = 0; i < TILES_PER_CELL; i++) {
        const dst_row = row_offset + TILES_PER_CELL + i;

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
      for (let i = 1; i < TILES_PER_CELL; i++) {
        const dst_row = row_offset + TILES_PER_CELL + i;
        for (let j = 0; j < TILES_PER_CELL; j++) {
          const dst_col = col_offset + j;
          indices.set(new Index2D(dst_row, dst_col), Tiles.WALL);
        }
      }
    }
  });

  // Draw the walls above the topmost rooms
  for (let i = 0; i < maze.cols; i++) {
    for (let j = 0; j < TILES_PER_CELL; j++) {
      const dst_col = TILES_PER_CELL + ROOM_STRIDE * i + j;
      indices.set(new Index2D(1, dst_col), Tiles.WALL);
      indices.set(new Index2D(2, dst_col), Tiles.WALL);
    }
  }
}

export function make_maze(rows, cols) {
  const maze = generate_maze(rows, cols);

  // The original width is N cells
  // then we add cells in between for corridors, that's N + (N - 1) = 2N - 1
  // then we add a 1-cell margin on each end for a total of 2N + 2 cells
  const indices = new Grid(
    TILES_PER_CELL * (2 * rows + 1),
    TILES_PER_CELL * (2 * cols + 1)
  );
  indices.fill(() => Tiles.CEILING);

  add_floors_and_walls(maze, indices);

  return indices;
}
