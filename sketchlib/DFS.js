/**
 * Interface for a generic depth-first seach. This is used
 * to customize the behavior of DFS
 *
 * @interface DFSTraversal
 * @template I The index type for the grid
 * @template {number | string} H The hash type
 */
export class DFSTraversal {
  /**
   * Get the total number of vertices to be traversed.
   * @return {number} The total number of vertices
   */
  get_vertex_count() {
    throw new Error("not implemented");
  }

  /**
   * For forest traversal, pick the next start node
   * @param {Set<H>} visited_set The visited elements
   * @return {I} The unvisited index to start
   */
  pick_start(visited_set) {
    throw new Error("not implemented");
  }

  /**
   * Hash a grid index to a unique key for a Set
   * @param {I} index The index type
   * @return {H} The hashed version of this index
   */
  hash(index) {
    throw new Error("not implemented");
  }

  /**
   * Get all the reachable neighbors from the given index. Do not check
   * if the neighbor is visited, this will be done by the DFS traversal.
   * @param {I} index The index of the current cell
   */
  get_neighbors(index) {
    throw new Error("not implemented");
  }

  /**
   * Function for selecting which order the neighbors will be traversed.
   * This will be pushed to a stack, so the next node visited will be the
   * LAST element returned.
   *
   * @param {I[]} neighbor_indices The indices of the neighbors
   * @return {I[]} the neighbor indices in reverse order of how they should be traversed.
   */
  order_neighbors(neighbor_indices) {
    throw new Error("not implemented");
  }
}

/**
 * A generic implementation of a DFS preorder traversal
 *
 * @template I The index type for the grid. G::I
 * @template H The hash type for indices.
 */
export class DFS {
  /**
   * Constructor
   * @param {DFSTraversal<G, I, H>} traversal The traversal logic for this particular traversal
   */
  constructor(traversal) {
    this.traversal = traversal;
  }

  /**
   * Perform DFS traversal until the entire
   *
   * @param {function(I[])} callback A function to call at each visited cell. The value is a path to this cell
   */
  dfs_forest(callback) {
    const visited = new Set();

    const vertex_count = this.traversal.get_vertex_count();
    while (visited.size < vertex_count) {
      const start_index = this.traversal.pick_start(visited);
      this.dfs_tree(start_index, callback, visited);
    }
  }

  /**
   * Perform a DFS traversal on a single start node
   * @param {I} start_index The index of the first cell to visit
   * @param {function(I[])} callback A function to call at each visited cell. The value is a path to the current cell.
   * @param {Set<H> | undefined} visited A set of hashed indices to indicate which cells were visited
   */
  dfs_tree(start_index, callback, visited) {
    visited = visited ?? new Set();

    const stack = [start_index];
    const path = [];
    while (stack.length > 0) {
      const current_index = stack.pop();

      // We visited this node before we got back to the stack entry
      const hash = this.traversal.hash(current_index);
      if (visited.has(hash)) {
        continue;
      }

      visited.add(hash);

      path.push(current_index);
      callback(path);

      const unvisited_neighbors = this.traversal
        .get_neighbors(current_index)
        .filter((index) => !visited.has(this.traversal.hash(index)));

      const ordered_neighbors =
        this.traversal.order_neighbors(unvisited_neighbors);

      if (ordered_neighbors.length > 0) {
        stack.push(...ordered_neighbors);
      } else {
        // We reached a dead end, backtrack
        path.pop();
      }
    }
  }
}
