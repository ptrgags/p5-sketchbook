import { describe, it, expect } from "vitest";
import { Direction } from "./Direction";
import { Point } from "./Point";
import { Line } from "./Line";
import { PGA_MATCHERS } from "../test_helpers/pga_matchers";

expect.extend(PGA_MATCHERS);

describe("Direction", () => {
  it("converts to point", () => {
    const a = new Direction(2, -5);

    const result = a.to_point();

    const expected = new Point(2, -5);
    expect(result).toBePoint(expected);
  });

  it("dir_from_angle computes cosine and sine", () => {
    const angle = (2 * Math.PI) / 3;

    const result = Direction.from_angle(angle);

    const expected = new Direction(-0.5, Math.sqrt(3) / 2);
    expect(result).toBeDirection(expected);
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
    expect(result).toBeDirection(expected);
  });

  it("mag_sqr returns squared magnitude", () => {
    const a = new Direction(3, 4);

    const result = a.mag_sqr();

    // 3^2 + 4^2
    expect(result).toBe(25);
  });

  it("mag returns the magnitude of the direction", () => {
    const a = new Direction(3, 4);

    const result = a.mag();

    // sqrt(3^2 + 4^2) = sqrt(25) = 5
    expect(result).toBeCloseTo(5);
  });

  it("limit_length with short direction does not change vector", () => {
    const a = new Direction(1, 2);
    const max_length = 100;

    const result = a.limit_length(max_length);

    expect(result).toBeDirection(a);
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
    const a = Direction.ZERO;
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
    expect(result).toBeDirection(expected);
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
    expect(result).toBeDirection(expected);
  });

  it("scale performs scalar multiplication", () => {
    const dir = new Direction(4, -3);

    const result = dir.scale(2);

    const expected = new Direction(8, -6);
    expect(result).toBeDirection(expected);
  });

  it("flip_y flips y coordinate of directions", () => {
    const dir = new Direction(3, -4);

    const result = dir.flip_y();

    const expected = new Direction(3, 4);
    expect(result).toBeDirection(expected);
  });

  it("dot of two directions computes the dot product of components", () => {
    const a = new Direction(1, 2);
    const b = new Direction(3, 4);

    const result = a.dot(b);

    // 1 * 3 + 2 * 4 = 3 + 8 = 11
    const expected = 11;
    expect(result).toBe(expected);
  });

  it("lerp interpolates two directions", () => {
    const a = new Direction(1, 2);
    const b = new Direction(-2, -8);

    const result = Direction.lerp(a, b, 0.25);

    // 3/4 * 1 + 1/4 * -2 = 1/4(3 -2) = 1/4
    // 3/4 * 2 + 1/4 * -8 = 1/4(6 - 8) = -2/4 = -1/2
    const expected = new Direction(0.25, -0.5);
    expect(result).toBeDirection(expected);
  });

  it("toString formats as direction", () => {
    const a = new Direction(0.00012345, 2.98763);

    const result = a.toString();

    const expected = "Direction(0.000123, 2.99)";
    expect(result).toBe(expected);
  });

  describe("roots_of_unity", () => {
    /**
     * Compare two arrays of points
     * @param {Direction[]} result
     * @param {Direction[]} expected
     */
    function expect_direction_array(result, expected) {
      expect(result.length).toBe(expected.length);

      for (const [i, res] of result.entries()) {
        expect(res).toBeDirection(expected[i]);
      }
    }

    it("with N < 1 throws error", () => {
      expect(() => {
        return Direction.roots_of_unity(0);
      }).toThrowError("n must be a positive integer");
    });

    it("with N = 1 produces single point", () => {
      const result = Direction.roots_of_unity(1);

      const expected = [Direction.DIR_X];

      expect_direction_array(result, expected);
    });

    it("with N = 2 produces 1 and -1", () => {
      const result = Direction.roots_of_unity(2);

      const expected = [Direction.DIR_X, Direction.DIR_X.neg()];

      expect_direction_array(result, expected);
    });

    it("with N = 4 produces cardinal directions", () => {
      const result = Direction.roots_of_unity(4);

      const expected = [
        Direction.DIR_X,
        Direction.DIR_Y,
        Direction.DIR_X.neg(),
        Direction.DIR_Y.neg(),
      ];
      expect_direction_array(result, expected);
    });
    it("with N = 8 produces 8 ordinal directions", () => {
      const result = Direction.roots_of_unity(8);

      // cos(45 deg) = sin(45 deg) = sqrt(2)/2 = sqrt(1/2)
      const xy45 = Math.SQRT1_2;
      const ne = new Direction(xy45, xy45);
      const nw = new Direction(-xy45, xy45);
      const expected = [
        Direction.DIR_X,
        ne,
        Direction.DIR_Y,
        nw,
        Direction.DIR_X.neg(),
        ne.neg(), // southwest
        Direction.DIR_Y.neg(),
        nw.neg(), // southeast
      ];

      expect_direction_array(result, expected);
    });

    it("with N = 3 produces correct trig values", () => {
      const result = Direction.roots_of_unity(3);

      const sin60 = Math.sqrt(3) / 2;

      const expected = [
        Direction.DIR_X,
        new Direction(-0.5, sin60),
        new Direction(-0.5, -sin60),
      ];
      expect_direction_array(result, expected);
    });
  });
});
