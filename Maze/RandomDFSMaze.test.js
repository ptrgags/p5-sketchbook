import { describe, it, expect } from "vitest";
import { generate_maze } from "./RandomDFSMaze";
import { GridDirection } from "../sketchlib/GridDiection";
import { griderator, Index2D } from "../sketchlib/Grid";

describe("generate_maze", () => {
  it("creates a grid of the given size", () => {
    const maze = generate_maze(4, 5);

    expect(maze.rows).toBe(4);
    expect(maze.cols).toBe(5);
  });

  it("every cell is connected to at least one neighbor", () => {
    const maze = generate_maze(4, 5);

    for (const cell of maze) {
      const connections = [
        cell.is_connected(GridDirection.RIGHT),
        cell.is_connected(GridDirection.UP),
        cell.is_connected(GridDirection.LEFT),
        cell.is_connected(GridDirection.DOWN),
      ];
      const has_connection = connections.some((x) => x);

      expect(has_connection).toBe(true);
    }
  });

  it("cells are doubly-linked correctly", () => {
    const maze = generate_maze(3, 4);

    // First let's check the left/right connections
    griderator(maze.rows, maze.cols - 1, (i, j) => {
      const left = new Index2D(i, j);
      const right = new Index2D(i, j + 1);

      // Either these both will be set or just one
      const connected_lr = maze.get(left).is_connected(GridDirection.RIGHT);
      const connected_rl = maze.get(right).is_connected(GridDirection.LEFT);
      expect(connected_lr).toBe(connected_rl);
    });

    // Now the up/down connections
    griderator(maze.rows - 1, maze.cols, (i, j) => {
      const up = new Index2D(i, j);
      const down = new Index2D(i + 1, j);

      // Either these both will be set or just one
      const connected_ud = maze.get(up).is_connected(GridDirection.DOWN);
      const connected_du = maze.get(down).is_connected(GridDirection.UP);
      expect(connected_ud).toBe(connected_du);
    });
  });

  it("cells on boundary do not have connections leaving maze", () => {
    const maze = generate_maze(3, 4);

    // Check the left/right connections
    for (let i = 0; i < maze.rows; i++) {
      const connected_left_edge = maze
        .get(new Index2D(i, 0))
        .is_connected(GridDirection.LEFT);
      const connected_right_edge = maze
        .get(new Index2D(i, maze.cols - 1))
        .is_connected(GridDirection.RIGHT);

      expect(connected_left_edge).toBe(false);
      expect(connected_right_edge).toBe(false);
    }

    // Check the up/down connections
    for (let i = 0; i < maze.cols; i++) {
      const connected_top_edge = maze
        .get(new Index2D(0, i))
        .is_connected(GridDirection.UP);
      const connected_bottom_edge = maze
        .get(new Index2D(maze.rows - 1, i))
        .is_connected(GridDirection.DOWN);

      expect(connected_top_edge).toBe(false);
      expect(connected_bottom_edge).toBe(false);
    }
  });
});
