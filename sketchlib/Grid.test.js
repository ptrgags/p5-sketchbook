import { describe, it, expect } from "vitest";
import { Grid, Index1D, Index2D } from "./Grid";

describe("Index1D", () => {
  it("throws for negative index", () => {
    expect(() => {
      new Index1D(-1);
    }).toThrowError("i must be non-negative");
  });
});

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
});

describe("Grid", () => {
  it("pre-allocates the array with undefined values", () => {
    const grid = new Grid(4, 5);

    for (const entry of grid) {
      expect(entry).toBeUndefined();
    }
  });

  it("set_1d with 2D index throws", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.set_1d(new Index2D(1, 1), "foo");
    }).toThrowError("index must be an Index1D object");
  });

  it("set_1d with 1D index throws for out of bounds", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.set_1d(new Index1D(16), "oops");
    }).toThrowError("index out of bounds");
  });

  it("set_1d sets value", () => {
    const grid = new Grid(4, 4);
    const index = new Index1D(3);

    grid.set_1d(index, 3);
    const result = grid.get_1d(index);

    expect(result).toBe(3);
  });

  it("get_1d with 2D index throws", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.get_1d(new Index2D(1, 1));
    }).toThrowError("index must be an Index1D object");
  });

  it("get_1d with 1D index throws for out of bounds", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.get_1d(new Index1D(16));
    }).toThrowError("index out of bounds");
  });

  it("set_2d with 1D index throws", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.set_2d(new Index1D(2), "foo");
    }).toThrowError("index must be an Index2D object");
  });

  it("set_1d with 2D index throws for out of bounds", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.set_2d(new Index2D(4, 0), "oops");
    }).toThrowError("index out of bounds");
  });

  it("set_2d sets value", () => {
    const grid = new Grid(4, 4);
    const index = new Index2D(2, 1);

    grid.set_2d(index, "foo");
    const result = grid.get_2d(index);

    expect(result).toBe("foo");
  });

  it("get_2d with 1D index throws", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.get_2d(new Index1D(2));
    }).toThrowError("index must be an Index2D object");
  });

  it("get_1d with 2D index throws for out of bounds", () => {
    const grid = new Grid(4, 4);

    expect(() => {
      grid.get_2d(new Index2D(4, 0));
    }).toThrowError("index out of bounds");
  });
});
