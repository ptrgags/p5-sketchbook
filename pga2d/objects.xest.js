import { describe, it, expect } from "vitest";
import { PGA_MATCHERS } from "./pga_matchers";
import { PI } from "../sketchlib/math_consts";

expect.extend(PGA_MATCHERS);

/**
 * Compare two arrays of points
 * @param {Point[]} result
 * @param {Point[]} expected
 */
function expect_point_array(result, expected) {
  expect(result.length).toBe(expected.length);

  for (const [i, res] of result.entries()) {
    expect(res).toBePoint(expected[i]);
  }
}

describe("Point", () => {
  describe("euclidean", () => {
    it("converts to direction", () => {
      const a = new Point(2, -5);

      const result = a.to_direction();

      const expected = new Direction(2, -5);
      expect(result).toBePoint(expected);
    });

    it("gets the underlying x and y components", () => {
      const a = new Point(2, -5);

      expect(a.x).toBe(2);
      expect(a.y).toBe(-5);
    });

    it("adding two points returns the midpoint", () => {
      const a = new Point(1, 2);
      const b = new Point(3, 4);

      const result = a.add(b);

      const expected = new Point(2, 3);
      expect(result).toEqual(expected);
    });

    it("adding a direction returns the correct point", () => {
      const a = new Point(1, 2);
      const dir = new Direction(3, 4);

      const result = a.add(dir);

      const expected = new Point(4, 6);
      expect(result).toBePoint(expected);
    });

    it("subtracting points produces the correct direction", () => {
      const a = new Point(1, 4);
      const b = new Point(3, 2);

      const result = a.sub(b);

      const expected = new Direction(-2, 2);
      expect(result).toBePoint(expected);
    });

    it("joining two points gives the line through them", () => {
      const a = new Point(0, 1);
      const b = new Point(1, 0);

      const result = a.join(b);

      const expected = new Line(1, 1, 1);
      expect(result).toBeLine(expected);
    });

    it("swapping join arguments reverses the line's orientation", () => {
      const a = new Point(0, 1);
      const b = new Point(1, 0);

      const result_forward = a.join(b);
      const result_backward = b.join(a);

      const expected_forward = new Line(1, 1, 1);
      const expected_backward = new Line(-1, -1, -1);
      expect(result_forward).toBeLine(expected_forward);
      expect(result_backward).toBeLine(expected_backward);
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

    it("toString formats as point", () => {
      const a = new Point(0.00012345, 2.98763);

      const result = a.toString();

      const expected = "Point(0.000123, 2.99)";
      expect(result).toBe(expected);
    });
  });

  describe("direction", () => {
    it("converts to point", () => {
      const a = new Direction(2, -5);

      const result = a.to_point();

      const expected = new Point(2, -5);
      expect(result).toBePoint(expected);
    });

    it("dir_from_angle computes cosine and sine", () => {
      const angle = (2 * PI) / 3;

      const result = Direction.from_angle(angle);

      const expected = new Direction(-0.5, Math.sqrt(3) / 2);
      expect(result).toBePoint(expected);
    });

    it("gets the underlying x and y components", () => {
      const a = new Direction(-3, 5);

      expect(a.x).toBe(-3);
      expect(a.y).toBe(5);
    });

    it("dual returns the orthogonal line", () => {
      const a = new Direction(2, 1);

      const result = a.dual();

      const expected = new Line(2, 1, 0);
      expect(result).toBeLine(expected);
    });

    it("neg negates the components", () => {
      const a = new Direction(1, -3);

      const result = a.neg();

      const expected = new Direction(-1, 3);
      expect(result).toBePoint(expected);
    });

    it("ideal norm returns the magnitude of x and y components", () => {
      const a = new Direction(3, 4);

      const result = a.ideal_norm_sqr();

      // 3^2 + 4^2
      expect(result).toBe(25);
    });

    it("ideal magnitude returns the magnitude of x and y components", () => {
      const a = new Direction(3, 4);

      const result = a.ideal_norm();

      // sqrt(3^2 + 4^2) = sqrt(25) = 5
      expect(result).toBeCloseTo(5);
    });

    it("limit_length with short direction does not change vector", () => {
      const a = new Direction(1, 2);
      const max_length = 100;

      const result = a.limit_length(max_length);

      expect(result).toEqual(a);
    });

    it("limit_length with long direction snaps to max length", () => {
      const a = new Direction(300, 400);
      const max_length = 100;

      const result = a.limit_length(max_length);

      // original vector has magnitude 500 (3-4-5 triangle scaled by 100)
      // the new magnitude is 100, which is 1/5 exactly.
      // 300 / 5  = 60
      // 400 / 5  = 80
      const expected = new Direction(60, 80);
      expect(result).toEqual(expected);
    });

    it("set_length with zero length direction throws error", () => {
      const a = Point.ZERO;
      const length = 100;

      expect(() => {
        a.set_length(length);
      }).toThrowError("null vector");
    });

    it("set_length with short direction snaps to length", () => {
      const a = new Direction(3, 4);
      const length = 100;

      const result = a.set_length(length);

      // original vector has magnitude 5 (3-4-5 triangle)
      // the new magnitude is 100, which is 1/5 exactly.
      // 300 / 5  = 60
      // 400 / 5  = 80
      const expected = new Direction(60, 80);
      expect(result).toBePoint(expected);
    });

    it("set_length with long direction snaps to max length", () => {
      const a = new Direction(300, 400);
      const max_length = 100;

      const result = a.set_length(max_length);

      // original vector has magnitude 500 (3-4-5 triangle scaled by 100)
      // the new magnitude is 100, which is 1/5 exactly.
      // 300 / 5  = 60
      // 400 / 5  = 80
      const expected = new Direction(60, 80);
      expect(result).toBePoint(expected);
    });

    it("scale performs scalar multiplication", () => {
      const dir = new Direction(4, -3);

      const result = dir.scale(2);

      const expected = new Direction(8, -6);
      expect(result).toBePoint(expected);
    });

    it("flip_y flips y coordinate of points", () => {
      const point = new Point(3, 4);

      const result = point.flip_y();

      const expected = new Point(3, -4);
      expect(result).toBePoint(expected);
    });

    it("flip_y flips y coordinate of directions", () => {
      const dir = new Direction(3, -4);

      const result = dir.flip_y();

      const expected = new Direction(3, 4);
      expect(result).toBePoint(expected);
    });

    it("dot of two directions computes the dot product of components", () => {
      const a = new Direction(1, 2);
      const b = new Direction(3, 4);

      const result = a.dot(b);

      // 1 * 3 + 2 * 4 = 3 + 8 = 11
      const expected = 11;
      expect(result).toBe(expected);
    });
  });

  it("lerp interpolates two directions", () => {
    const a = new Direction(1, 2);
    const b = new Direction(-2, -8);

    const result = Point.lerp(a, b, 0.25);

    // 3/4 * 1 + 1/4 * -2 = 1/4(3 -2) = 1/4
    // 3/4 * 2 + 1/4 * -8 = 1/4(6 - 8) = -2/4 = -1/2
    const expected = new Direction(0.25, -0.5);
    expect(result).toBePoint(expected);
  });

  describe("roots_of_unity", () => {
    it("with N < 1 throws error", () => {
      expect(() => {
        return Point.roots_of_unity(0);
      }).toThrowError("n must be a positive integer");
    });

    it("with N = 1 produces single point", () => {
      const result = Point.roots_of_unity(1);

      const expected = [Point.DIR_X];

      expect_point_array(result, expected);
    });

    it("with N = 2 produces 1 and -1", () => {
      const result = Point.roots_of_unity(2);

      const expected = [Point.DIR_X, Point.DIR_X.neg()];

      expect_point_array(result, expected);
    });

    it("with N = 4 produces cardinal directions", () => {
      const result = Point.roots_of_unity(4);

      const expected = [
        Point.DIR_X,
        Point.DIR_Y,
        Point.DIR_X.neg(),
        Point.DIR_Y.neg(),
      ];
      expect_point_array(result, expected);
    });

    it("with N = 8 produces 8 ordinal directions", () => {
      const result = Point.roots_of_unity(8);

      // cos(45 deg) = sin(45 deg) = sqrt(2)/2 = sqrt(1/2)
      const xy45 = Math.SQRT1_2;
      const ne = new Direction(xy45, xy45);
      const nw = Direction(-xy45, xy45);
      const expected = [
        Point.DIR_X,
        ne,
        Point.DIR_Y,
        nw,
        Point.DIR_X.neg(),
        ne.neg(), // southwest
        Point.DIR_Y.neg(),
        nw.neg(), // southeast
      ];

      expect_point_array(result, expected);
    });

    it("with N = 3 produces correct trig values", () => {
      const result = Point.roots_of_unity(3);

      const sin60 = Math.sqrt(3) / 2;

      const expected = [
        Point.DIR_X,
        Point.direction(-0.5, sin60),
        Point.direction(-0.5, -sin60),
      ];
      expect_point_array(result, expected);
    });
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

    const expected = new Point(1.5, -0.5);
    expect(result).toBePoint(expected);
  });

  it("toString formats as direction", () => {
    const a = Point.direction(0.00012345, 2.98763);

    const result = a.toString();

    const expected = "Direction(0.000123, 2.99)";
    expect(result).toBe(expected);
  });
});
