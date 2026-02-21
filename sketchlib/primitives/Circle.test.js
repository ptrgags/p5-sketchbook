import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/Point.js";
import { Circle } from "./Circle.js";
import { GEOMETRY_MATCHERS } from "../test_helpers/geometry_matchers.js";

expect.extend(GEOMETRY_MATCHERS);

describe("Circle", () => {
  describe("contains", () => {
    it("with circle center returns true", () => {
      const circle = new Circle(new Point(3, -4), 5);

      const result = circle.contains(circle.center);

      expect(result).toBe(true);
    });

    it("with point inside circle returns true", () => {
      const circle = new Circle(new Point(3, -4), 5);
      const point = new Point(5, -2);

      const result = circle.contains(point);

      expect(result).toBe(true);
    });

    it("with point on circle boundary returns false", () => {
      const circle = new Circle(new Point(3, -4), 5);
      const point = new Point(8, -4);

      const result = circle.contains(point);

      expect(result).toBe(false);
    });

    it("with point outside circle returns false", () => {
      const circle = new Circle(new Point(3, -4), 5);
      const point = new Point(10, 10);

      const result = circle.contains(point);

      expect(result).toBe(false);
    });
  });

  describe("from_two_points", () => {
    it("with identical points returns degenerate circle", () => {
      const a = new Point(1, 2);

      const result = Circle.from_two_points(a, a);

      const expected = new Circle(new Point(1, 2), 0);
      expect(result).toBeCircle(expected);
    });

    it("with different points computes correct circle", () => {
      // the points are arranged so the displacement is a pythagorean
      // triple
      //
      // b
      // |\
      // | \ 5
      // |4 \
      // |   \
      // .____a
      //   3
      const a = new Point(1, 1);
      const b = new Point(-2, 5);

      const result = Circle.from_two_points(a, b);

      // center: ((1 - 2) / 2, (1 + 5) /2) = (-1/2, 6/2) = (-0.5, 3)
      const expected_center = new Point(-0.5, 3);
      const expected_radius = 5 / 2;
      const expected = new Circle(expected_center, expected_radius);
      expect(result).toBeCircle(expected);
    });
  });
});
