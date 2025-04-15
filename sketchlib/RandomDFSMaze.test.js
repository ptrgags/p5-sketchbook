import { describe, it, expect } from "vitest";
import { generate_maze } from "./RandomDFSMaze";
import { Direction } from "./Direction";
import { griderator, Index2D } from "./Grid";

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
        cell.is_connected(Direction.RIGHT),
        cell.is_connected(Direction.UP),
        cell.is_connected(Direction.LEFT),
        cell.is_connected(Direction.DOWN),
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
      const connected_lr = maze.get(left).is_connected(Direction.RIGHT);
      const connected_rl = maze.get(right).is_connected(Direction.LEFT);
      expect(connected_lr).toBe(connected_rl);
    });

    // Now the up/down connections
    griderator(maze.rows - 1, maze.cols, (i, j) => {
      const up = new Index2D(i, j);
      const down = new Index2D(i + 1, j);

      // Either these both will be set or just one
      const connected_ud = maze.get(up).is_connected(Direction.DOWN);
      const connected_du = maze.get(down).is_connected(Direction.UP);
      expect(connected_ud).toBe(connected_du);
    });
  });

  it("cells on boundary do not have connections leaving maze", () => {
    const maze = generate_maze(3, 4);

    // Check the left/right connections
    for (let i = 0; i < maze.rows; i++) {
      const connected_left_edge = maze
        .get(new Index2D(i, 0))
        .is_connected(Direction.LEFT);
      const connected_right_edge = maze
        .get(new Index2D(i, maze.cols - 1))
        .is_connected(Direction.RIGHT);

      expect(connected_left_edge).toBe(false);
      expect(connected_right_edge).toBe(false);
    }

    // Check the up/down connections
    for (let i = 0; i < maze.cols; i++) {
      const connected_top_edge = maze
        .get(new Index2D(0, i))
        .is_connected(Direction.UP);
      const connected_bottom_edge = maze
        .get(new Index2D(maze.rows - 1, i))
        .is_connected(Direction.DOWN);

      expect(connected_top_edge).toBe(false);
      expect(connected_bottom_edge).toBe(false);
    }
  });
});
