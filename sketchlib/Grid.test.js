import { describe, it, expect } from "vitest";
import { Grid, Index2D } from "./Grid";

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

    const expected = new Index2D(2, 6);
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
    expect(result).toEqual(result);
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

    const result = grid.right(index);

    const expected = new Index2D(3, 0);
    expect(result).toEqual(result);
  });
});
