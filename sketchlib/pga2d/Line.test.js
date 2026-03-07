import { describe, it, expect } from "vitest";
import { Line } from "./Line";
import { Point } from "./Point";
import { PGA_MATCHERS } from "../test_helpers/pga_matchers";
import { LineSegment } from "../primitives/LineSegment.js";

expect.extend(PGA_MATCHERS);

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

  describe("from_segment", () => {
    it("with start = end throws", () => {
      const point = new Point(3, -4);
      const segment = new LineSegment(point, point);

      expect(() => {
        return Line.from_segment(segment);
      }).toThrowError("line segment must have two different end points");
    });

    it("computes line with normal 90 degrees in the positive direction of the tangent", () => {
      const a = new Point(-1, 1);
      const b = new Point(1, -1);
      const segment = new LineSegment(a, b);

      const result = Line.from_segment(segment);

      const expected = new Line(1, 1, 0);
      expect(result).toBeLine(expected);
    });
  });
});
