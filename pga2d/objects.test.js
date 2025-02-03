import { describe, it, expect } from "vitest";
import { Point, Line } from "./objects";
import { PGA_MATCHERS } from "./pga_matchers";

expect.extend(PGA_MATCHERS);

describe("Point", () => {
  describe("euclidean", () => {
    it("gets the underlying x and y components", () => {
      const a = Point.point(2, -5);

      expect(a.x).toBe(2);
      expect(a.y).toBe(-5);
    });

    it("adding two points returns the midpoint", () => {
      const a = Point.point(1, 2);
      const b = Point.point(3, 4);

      const result = a.add(b);

      const expected = Point.point(2, 3);
      expect(result).toEqual(expected);
    });

    it("adding a direction returns the correct point", () => {
      const a = Point.point(1, 2);
      const dir = Point.direction(3, 4);

      const result = a.add(dir);

      const expected = Point.point(4, 6);
      expect(result).toEqual(expected);
    });

    it("subtracting points produces the correct direction", () => {
      const a = Point.point(1, 4);
      const b = Point.point(3, 2);

      const result = a.sub(b);

      const expected = Point.direction(-2, 2);
      expect(result).toEqual(expected);
    });

    it("joining two points gives the line through them", () => {
      const a = Point.point(0, 1);
      const b = Point.point(1, 0);

      const result = a.join(b);

      const expected = new Line(1, 1, 1);
      expect(result).toEqual(expected);
    });

    it("swapping join arguments reverses the line's orientation", () => {
      const a = Point.point(0, 1);
      const b = Point.point(1, 0);

      const result = a.join(b);

      const expected = new Line(-1, -1, 1);
      expect(result).toBeLine(expected);
    });

    it("lerp interpolates two points", () => {
      const a = Point.point(1, 2);
      const b = Point.point(-2, -8);

      const result = Point.lerp(a, b, 0.25);

      // 3/4 * 1 + 1/4 * -2 = 1/4(3 -2) = 1/4
      // 3/4 * 2 + 1/4 * -8 = 1/4(6 - 8) = -2/4 = -1/2
      const expected = Point.point(0.25, -0.5);
      expect(result).toEqual(expected);
    });
  });

  describe("ideal", () => {
    it("gets the underlying x and y components", () => {
      const a = Point.direction(-3, 5);

      expect(a.x).toBe(-3);
      expect(a.y).toBe(5);
    });

    it("dual returns the orthogonal line", () => {
      const a = Point.direction(2, 1);

      const result = a.dual();

      const expected = new Line(2, 1, 0);
      expect(result).toEqual(expected);
    });

    it("neg negates the components", () => {
      const a = Point.direction(1, -3);

      const result = a.neg();

      const expected = Point.direction(-1, 3);
      expect(result).toEqual(expected);
    });

    it("ideal norm returns the magnitude of x and y components", () => {
      const a = Point.direction(3, 4);

      const result = a.ideal_norm();

      // 3^2 + 4^2
      expect(result).toBe(25);
    });

    it("ideal magnitude returns the magnitude of x and y components", () => {
      const a = Point.direction(3, 4);

      const result = a.ideal_mag();

      // sqrt(3^2 + 4^2) = sqrt(25) = 5
      expect(result).toBeCloseTo(5);
    });

    it("scale performs scalar multiplication", () => {
      const dir = Point.direction(4, -3);

      const result = dir.scale(2);

      const expected = Point.direction(8, -6);
      expect(result).toEqual(expected);
    });

    it("dot of two directions computes the dot product of components", () => {
      const a = Point.direction(1, 2);
      const b = Point.direction(3, 4);

      const result = a.dot(b);

      // 1 * 3 + 2 * 4 = 3 + 8 = 11
      const expected = 11;
      expect(result).toBe(expected);
    });
  });

  it("lerp interpolates two directions", () => {
    const a = Point.direction(1, 2);
    const b = Point.direction(-2, -8);

    const result = Point.lerp(a, b, 0.25);

    // 3/4 * 1 + 1/4 * -2 = 1/4(3 -2) = 1/4
    // 3/4 * 2 + 1/4 * -8 = 1/4(6 - 8) = -2/4 = -1/2
    const expected = Point.direction(0.25, -0.5);
    expect(result).toEqual(expected);
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

  it("meet of axes returns origin", () => {
    const a = Line.X_AXIS;
    const b = Line.Y_AXIS;

    const result = a.meet(b);

    expect(result).toBePoint(Point.ORIGIN);
  });

  it("meet of two lines returns their intersection", () => {
    const a = new Line(1, 1, 1);
    const b = new Line(1, -1, 2);

    const result = a.meet(b);

    const expected = Point.point(1.5, -0.5);
    expect(result).toBePoint(expected);
  });
});
