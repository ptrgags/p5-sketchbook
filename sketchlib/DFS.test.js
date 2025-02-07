import { describe, it, expect } from "vitest";
import { Grid } from "./Grid";
import { DFS } from "./DFS";
import { GridDFSTraversal } from "./GridDFSTraversal";

// Make a grid that stores the index of each cell in the cell itself.
function make_grid() {
  const grid = new Grid(4, 4);
  grid.fill((index) => index);
  return grid;
}

function make_simple_dfs(grid) {
  const traversal = new GridDFSTraversal(grid);
  const dfs = new DFS(traversal);
  return dfs;
}

describe("DFS", () => {
  it("path in callback include the current cell", () => {
    const grid = make_grid();
    const dfs = make_simple_dfs(grid);

    dfs.dfs_forest((path) => {
      const last_index = path[path.length - 1];
      expect(last_index).toEqual(grid.get(last_index));
    });
  });

  it("with simple traversal, iterates the correct number of times", () => {
    const grid = make_grid();
    const dfs = make_simple_dfs(grid);

    let visited_counter = 0;
    dfs.dfs_forest((path) => {
      visited_counter++;
    });

    expect(visited_counter).toBe(16);
  });

  it("with simple traversal, paths are correct", () => {
    const grid = make_grid();
    const dfs = make_simple_dfs(grid);
    const expected_hashes = [
      0, 4, 8, 12, 13, 9, 5, 1, 2, 6, 10, 14, 15, 11, 7, 3,
    ];

    dfs.dfs_forest((path) => {
      const path_hashes = path.map((index) => grid.hash(index));

      const expected = expected_hashes.slice(0, path.length);
      expect(path_hashes).toEqual(expected);
    });
  });
});
