import { describe, it, expect } from "vitest";
import { Point, Direction, Line } from "./objects";

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
});

describe("Direction", () => {
  it("gets the underlying x and y components", () => {
    const a = new Direction(-3, 5);

    expect(a.x).toBe(-3);
    expect(a.y).toBe(5);
  });

  it("dual returns the orthogonal line", () => {
    const a = new Direction(2, 1);

    const result = a.dual();

    const expected = new Line(2, 1, 0);
    expect(result).toEqual(expected);
  });

  it("neg negates the components", () => {
    const a = new Direction(1, -3);

    const result = a.neg();

    const expected = new Direction(-1, 3);
    expect(result).toEqual(expected);
  });

  it("norm returns the sum of squared components", () => {
    const a = new Direction(3, 4);

    const result = a.norm();

    expect(result).toBe(25);
  });

  it("magnitude returns the magnitude", () => {
    const a = new Direction(3, 4);

    const result = a.magnitude();

    expect(result).toBeCloseTo(5);
  });

  it("scale performs scalar multiplication", () => {
    const dir = new Direction(4, -3);

    const result = dir.scale(2);

    const expected = new Direction(8, -6);
    expect(result).toEqual(expected);
  });

  it("dot of two directions computes the dot product of components", () => {
    const a = new Direction(1, 2);
    const b = new Direction(3, 4);

    const result = a.dot(b);

    // 1 * 3 + 2 * 4 = 11
    const expected = 11;
    expect(result).toBe(expected);
  });
});

describe("Line", () => {
  it("constructor normalizes Euclidean line", () => {
    const line = new Line(3, 4, 5);

    expect(line.is_infinite).toBe(false);
    expect(line.nx).toBe(3 / 5);
    expect(line.ny).toBe(4 / 5);
    expect(line.d).toBe(1);
  });

  it("constructor doesn't modify line at infinity", () => {
    const line = new Line(0, 0, 42);

    expect(line.is_infinite).toBe(true);
    expect(line.nx).toBe(0);
    expect(line.ny).toBe(0);
    expect(line.d).toBe(42);
  });
});
