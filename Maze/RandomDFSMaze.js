import { Grid, Index2D } from "../sketchlib/Grid.js";
import { Random } from "../sketchlib/random.js";
import { DFS } from "../sketchlib/DFS.js";
import { FlagSet } from "../sketchlib/FlagSet.js";
import { GridDirection } from "../sketchlib/GridDiection.js";

class MazeCell {
  constructor() {
    this.connection_flags = new FlagSet(0, GridDirection.COUNT);
  }

  is_connected(direction) {
    return this.connection_flags.has_flag(direction);
  }

  static connect_neighbors(cell_a, cell_b, dir_ab) {
    const dir_ba = GridDirection.opposite(dir_ab);
    cell_a.connection_flags.set_flag(dir_ab);
    cell_b.connection_flags.set_flag(dir_ba);
  }
}

/**
 * DFSTraversal to create a maze via the random DFS algorithm presented in
 * _Mazes for Programmers_ by Jamis Buck
 */
export class RandomDFSMazeTraversal {
  constructor(grid) {
    this.grid = grid;
  }

  get_vertex_count() {
    return this.grid.length;
  }

  pick_start() {
    const row = Random.rand_int(0, this.grid.rows);
    const col = Random.rand_int(0, this.grid.cols);
    return new Index2D(row, col);
  }

  hash(index) {
    return this.grid.hash(index);
  }

  get_neighbors(index) {
    const neighbors_in_bounds = this.grid.get_neighbors(index);
    const current = this.grid.get(index);

    // We want the neighbors that are _not_ yet connected
    return neighbors_in_bounds.filter((x) => {
      const direction = index.direction_to(x);
      return !current.is_connected(direction);
    });
  }

  order_neighbors(neighbor_indices) {
    return Random.shuffle(neighbor_indices);
  }
}

export function generate_maze(rows, cols) {
  const grid = new Grid(rows, cols);
  grid.fill(() => {
    return new MazeCell();
  });

  const traversal = new RandomDFSMazeTraversal(grid);
  const dfs = new DFS(grid, traversal);

  dfs.dfs_forest((path) => {
    if (path.length >= 2) {
      const prev_index = path[path.length - 2];
      const curr_index = path[path.length - 1];
      const prev_cell = grid.get(prev_index);
      const curr_cell = grid.get(curr_index);

      const dir = prev_index.direction_to(curr_index);
      MazeCell.connect_neighbors(prev_cell, curr_cell, dir);
    }
  });

  return grid;
}
