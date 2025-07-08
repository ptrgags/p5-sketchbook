import { describe, it, expect, test } from "vitest";
import { Grid, griderator, Index2D } from "./Grid";
import { Direction } from "./Direction";
import { Rectangle } from "../lab/lablib/Rectangle";
import { Point } from "../pga2d/objects";
import { PGA_MATCHERS } from "../pga2d/pga_matchers";

expect.extend(PGA_MATCHERS);

describe("Index2D", () => {
  it("throws for negative row", () => {
    expect(() => {
      new Index2D(-1, 1);
    }).toThrowError("i must be non-negative");
  });

  it("throws for negative column", () => {
    expect(() => {
      new Index2D(3, -1);
    }).toThrowError("j must be non-negative");
  });

  it("left returns undefined at left boundary", () => {
    const index = new Index2D(1, 0);

    const result = index.left();

    expect(result).toBeUndefined();
  });

  it("left computes left neighbor", () => {
    const index = new Index2D(1, 5);

    const result = index.left();

    const expected = new Index2D(1, 4);
    expect(result).toEqual(expected);
  });

  it("right computes right neighbor", () => {
    const index = new Index2D(1, 5);

    const result = index.right();

    const expected = new Index2D(1, 6);
    expect(result).toEqual(expected);
  });

  it("up returns undefined at top boundary", () => {
    const index = new Index2D(0, 1);

    const result = index.up();

    expect(result).toBeUndefined();
  });

  it("up computes upwards neighbor", () => {
    const index = new Index2D(1, 5);

    const result = index.up();

    const expected = new Index2D(0, 5);
    expect(result).toEqual(expected);
  });

  it("down computes downwards neighbor", () => {
    const index = new Index2D(1, 5);

    const result = index.down();

    const expected = new Index2D(2, 5);
    expect(result).toEqual(expected);
  });

  describe("direction_to", () => {
    it("with same index returns undefined", () => {
      const index = new Index2D(1, 5);

      const result = index.direction_to(index);

      expect(result).toBeUndefined();
    });

    it("with non-adjacent index returns undefined", () => {
      const a = new Index2D(1, 5);
      const b = new Index2D(3, 5);

      const result = a.direction_to(b);

      expect(result).toBeUndefined();
    });

    test.each([
      ["right", 1, 6, Direction.RIGHT],
      ["up", 0, 5, Direction.UP],
      ["left", 1, 4, Direction.LEFT],
      ["down", 2, 5, Direction.DOWN],
    ])(
      "with adjacent cell returns the correct direction: %s",
      (label, i, j, expected) => {
        const a = new Index2D(1, 5);
        const neighbor = new Index2D(i, j);

        const result = a.direction_to(neighbor);

        expect(result).toBe(expected);
      }
    );
  });

  describe("to_world", () => {
    it("computes correct position without offset", () => {
      const index = new Index2D(1, 3);
      const offset = Point.ORIGIN;
      const stride = Point.direction(2, 4);

      const result = index.to_world(offset, stride);

      const expected = Point.direction(6, 4);
      expect(result).toBePoint(expected);
    });

    it("computes correct position with offset", () => {
      const index = new Index2D(1, 3);
      const offset = Point.point(4, 4);
      const stride = Point.direction(2, 4);

      const result = index.to_world(offset, stride);

      const expected = Point.direction(10, 8);
      expect(result).toBePoint(expected);
    });
  });
});

describe("griderator", () => {
  it("calls the callback for the given number of rows and columns", () => {
    const result = [];
    griderator(2, 3, (i, j) => {
      result.push([i, j]);
    });

    const expected = [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
      [1, 2],
    ];
    expect(result).toEqual(expected);
  });
});

describe("Grid", () => {
  it("pre-allocates the array with undefined values", () => {
    const grid = new Grid(4, 5);

    for (const entry of grid) {
      expect(entry).toBeUndefined();
    }
  });

  it("entries enumerates the entries", () => {
    const grid = new Grid(2, 2);
    grid.fill((index) => {
      return index.i;
    });

    const result = [];
    for (const x of grid.entries()) {
      result.push(x);
    }

    const expected = [
      [0, 0],
      [1, 0],
      [2, 1],
      [3, 1],
    ];
    expect(result).toEqual(expected);
  });

  it("fill populates the array with the callback values", () => {
    const grid = new Grid(2, 2);

    grid.fill((index) => {
      const { i, j } = index;

      return i * 2 + j;
    });
    const result = [...grid];

    const expected = [0, 1, 2, 3];
    expect(result).toEqual(expected);
  });

  it("for_each calls a callback at each grid cell", () => {
    const grid = new Grid(2, 2);
    grid.fill((index) => {
      const { i, j } = index;

      return i * 2 + j;
    });

    const indices = [];
    const values = [];
    grid.for_each((index, value) => {
      indices.push(index);
      values.push(value);
    });

    const expected_indices = [
      new Index2D(0, 0),
      new Index2D(0, 1),
      new Index2D(1, 0),
      new Index2D(1, 1),
    ];
    const expected_values = [0, 1, 2, 3];
    expect(indices).toEqual(expected_indices);
    expect(values).toEqual(expected_values);
  });

  it("map computes a new grid of the same size", () => {
    const grid = new Grid(2, 2);
    grid.fill((index) => {
      const { i, j } = index;

      return i + j;
    });

    const result_grid = grid.map((index, x) => {
      const { i, j } = index;
      return `(${i}, ${j}): ${x}`;
    });
    const result_values = [...result_grid];

    const expected = ["(0, 0): 0", "(0, 1): 1", "(1, 0): 1", "(1, 1): 2"];
    expect(result_values).toEqual(expected);
  });

  it("map array returns results in an array instead of a Grid", () => {
    const grid = new Grid(2, 2);
    grid.fill((index) => {
      const { i, j } = index;

      return i + j;
    });

    const result = grid.map_array((index, x) => {
      const { i, j } = index;
      return `(${i}, ${j}): ${x}`;
    });

    const expected = ["(0, 0): 0", "(0, 1): 1", "(1, 0): 1", "(1, 1): 2"];
    expect(result).toEqual(expected);
  });

  it("set_2d with 1D index throws", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.set(2, "foo");
    }).toThrowError("index must be an Index2D object");
  });

  it("set_1d with 2D index throws for out of bounds", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.set(new Index2D(4, 0), "oops");
    }).toThrowError("index out of bounds");
  });

  it("set_2d sets value", () => {
    const grid = new Grid(4, 4);
    const index = new Index2D(2, 1);

    grid.set(index, "foo");
    const result = grid.get(index);

    expect(result).toBe("foo");
  });

  it("get with 1D index throws", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.get(2);
    }).toThrowError("index must be an Index2D object");
  });

  it("get with 2D index throws for out of bounds", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.get(new Index2D(4, 0));
    }).toThrowError("index out of bounds");
  });

  it("get with 2D index returns correct grid entry", () => {
    const grid = new Grid(4, 4);
    grid.fill((index) => {
      return index;
    });
    const index = new Index2D(2, 1);

    const result = grid.get(index);
    expect(result).toEqual(index);
  });

  it("hash with 2D index returns 1D array index", () => {
    const grid = new Grid(2, 3);
    const index = new Index2D(1, 1);

    const result = grid.hash(index);

    // 1 * 3 + 1 = 4
    const expected = 4;
    expect(result).toBe(expected);
  });

  it("right with index at right edge returns undefined", () => {
    const grid = new Grid(4, 4);
    const on_edge = new Index2D(0, 3);

    const result = grid.right(on_edge);

    expect(result).toBeUndefined();
  });

  it("right with index in bounds returns right neighbor", () => {
    const grid = new Grid(4, 4);
    const index = new Index2D(0, 2);

    const result = grid.right(index);

    const expected = new Index2D(0, 3);
    expect(result).toEqual(expected);
  });

  it("down with index at bottom edge returns undefined", () => {
    const grid = new Grid(4, 4);
    const on_edge = new Index2D(3, 0);

    const result = grid.down(on_edge);

    expect(result).toBeUndefined();
  });

  it("down with index in bounds returns downward neighbor", () => {
    const grid = new Grid(4, 4);
    const index = new Index2D(2, 0);

    const result = grid.down(index);

    const expected = new Index2D(3, 0);
    expect(result).toEqual(expected);
  });

  it("get_neighbors with index out of bounds returns empty array", () => {
    const grid = new Grid(4, 4);
    const index = new Index2D(10, 5);

    const result = grid.get_neighbors(index);

    const expected = [];
    expect(result).toEqual(expected);
  });

  it("get_neighbors with index in the middle of the grid returns 4 neighbors in CCW order", () => {
    const grid = new Grid(4, 4);
    const index = new Index2D(2, 1);

    const result = grid.get_neighbors(index);

    const expected = [
      new Index2D(2, 2),
      new Index2D(1, 1),
      new Index2D(2, 0),
      new Index2D(3, 1),
    ];
    expect(result).toEqual(expected);
  });

  it("get_neighbors with index on right edge returns 3 neighbors in CCW order", () => {
    const grid = new Grid(4, 4);
    const index = new Index2D(2, 3);

    const result = grid.get_neighbors(index);

    const expected = [new Index2D(1, 3), new Index2D(2, 2), new Index2D(3, 3)];
    expect(result).toEqual(expected);
  });

  it("get_neighbors with index on bottom edge returns 3 neighbors in CCW order", () => {
    const grid = new Grid(4, 4);
    const index = new Index2D(3, 2);

    const result = grid.get_neighbors(index);

    const expected = [new Index2D(3, 3), new Index2D(2, 2), new Index2D(3, 1)];
    expect(result).toEqual(expected);
  });

  it("get_neighbors with index in corner returns 2 neighbors in CCW order", () => {
    const grid = new Grid(4, 4);
    const index = new Index2D(3, 0);

    const result = grid.get_neighbors(index);

    const expected = [
      // right
      new Index2D(3, 1),
      // up
      new Index2D(2, 0),
    ];
    expect(result).toEqual(expected);
  });

  describe("compute_layout", () => {
    it("computes a layout without spacing or margins", () => {
      const grid = new Grid(2, 2);
      const boundary = new Rectangle(Point.ORIGIN, Point.direction(4, 4));
      const item_size = Point.direction(2, 2);
      const margin = Point.ZERO;

      const [offset, stride] = grid.compute_layout(boundary, item_size, margin);

      const expected_offset = Point.ORIGIN;
      const expected_stride = Point.direction(2, 2);
      expect(offset).toBePoint(expected_offset);
      expect(stride).toBePoint(expected_stride);
    });

    it("computes a layout with margins", () => {
      const grid = new Grid(2, 2);
      const boundary = new Rectangle(Point.ORIGIN, Point.direction(8, 12));
      const item_size = Point.direction(2, 2);
      const margin = Point.direction(2, 4);

      const [offset, stride] = grid.compute_layout(boundary, item_size, margin);

      const expected_offset = Point.point(2, 4);
      const expected_stride = Point.direction(2, 2);
      expect(offset).toBePoint(expected_offset);
      expect(stride).toBePoint(expected_stride);
    });

    it("computes a layout with spacing", () => {
      const grid = new Grid(2, 2);
      const boundary = new Rectangle(Point.ORIGIN, Point.direction(8, 10));
      const item_size = Point.direction(2, 2);
      const margin = Point.ZERO;

      const [offset, stride] = grid.compute_layout(boundary, item_size, margin);

      const expected_offset = Point.ORIGIN;
      const expected_stride = Point.direction(6, 8);
      expect(offset).toBePoint(expected_offset);
      expect(stride).toBePoint(expected_stride);
    });

    it("computes a layout with spacing and margins", () => {
      const grid = new Grid(3, 3);
      const boundary = new Rectangle(Point.ORIGIN, Point.direction(16, 8));
      const item_size = Point.direction(2, 2);
      const margin = Point.direction(4, 1);

      const [offset, stride] = grid.compute_layout(boundary, item_size, margin);

      const expected_offset = Point.point(4, 1);
      const expected_stride = Point.direction(3, 2);
      expect(offset).toBePoint(expected_offset);
      expect(stride).toBePoint(expected_stride);
    });
  });
});
