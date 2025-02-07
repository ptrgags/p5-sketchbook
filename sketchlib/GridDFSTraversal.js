import { Index2D } from "./Grid.js";

/**
 * A simple DFS traversal of a grid that is completely deterministic
 * It's handy for unit testing and can be used as a starting place for making
 * more specialized algorithms.
 * It has the tendency to zig-zag over the grid.
 */
export class GridDFSTraversal {
  constructor(grid) {
    this.grid = grid;
  }

  get_vertex_count() {
    return this.grid.length;
  }

  pick_start(visited_set) {
    for (let i = 0; i < this.grid.rows; i++) {
      for (let j = 0; j < this.grid.cols; j++) {
        const index = new Index2D(i, j);
        const hash = this.grid.hash(index);
        if (!visited_set.has(hash)) {
          return index;
        }
      }
    }

    return undefined;
  }

  hash(index) {
    return this.grid.hash(index);
  }

  get_neighbors(index) {
    return this.grid.get_neighbors(index);
  }

  order_neighbors(neighbor_indices) {
    return neighbor_indices;
  }
}
