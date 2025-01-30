import { describe, it, expect } from "vitest";
import { Point, Direction } from "./objects";

describe("Point", () => {
  it("gets the underlying x and y components", () => {
    const a = new Point(2, -5);

    expect(a.x).toBe(2);
    expect(a.y).toBe(-5);
  });

  it("adding a direction returns the correct point", () => {
    const a = new Point(1, 2);
    const dir = new Direction(3, 4);

    const result = a.add(dir);

    const expected = new Point(4, 6);
    expect(result).toEqual(expected);
  });

  it("subtracting points produces the correct direction", () => {
    const a = new Point(1, 4);
    const b = new Point(3, 2);

    const result = a.sub(b);

    const expected = new Direction(-2, 2);
    expect(result).toEqual(expected);
  });

  it("lerp interpolates two points", () => {
    const a = new Point(1, 2);
    const b = new Point(-2, -8);

    const result = Point.lerp(a, b, 0.25);

    // 3/4 * 1 + 1/4 * -2 = 1/4(3 -2) = 1/4
    // 3/4 * 2 + 1/4 * -8 = 1/4(6 - 8) = -2/4 = -1/2
    const expected = new Point(0.25, -0.5);
    expect(result).toEqual(expected);
  });
});

describe("Direction", () => {
  it("gets the underlying x and y components", () => {
    const a = new Direction(-3, 5);

    expect(a.x).toBe(-3);
    expect(a.y).toBe(5);
  });

  it("norm returns the sum of squared components", () => {
    const a = new Direction(3, 4);

    const result = a.norm();

    expect(result).toBe(25);
  });

  it("scale performs scalar multiplication", () => {
    const dir = new Direction(4, -3);

    const result = dir.scale(2);

    const expected = new Direction(8, -6);
    expect(result).toEqual(expected);
  });
});
