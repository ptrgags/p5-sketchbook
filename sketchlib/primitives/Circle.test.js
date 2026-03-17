import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/Point.js";
import { Circle } from "./Circle.js";

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

    it("with point on circle boundary returns true", () => {
      const circle = new Circle(new Point(3, -4), 5);
      const point = new Point(8, -4);

      const result = circle.contains(point);

      expect(result).toBe(true);
    });

    it("with point outside circle returns false", () => {
      const circle = new Circle(new Point(3, -4), 5);
      const point = new Point(10, 10);

      const result = circle.contains(point);

      expect(result).toBe(false);
    });
  });

  describe("get_angle", () => {
    it("with point at center returns 0", () => {
      const circle = new Circle(new Point(3, -4), 5);

      const result = circle.get_angle(circle.center);

      const expected = 0;
      expect(result).toBeCloseTo(expected);
    });

    it("with point to the right of center returns angle of 0", () => {
      const circle = new Circle(new Point(3, -4), 5);
      const right_of_center = new Point(4, -4);

      const result = circle.get_angle(right_of_center);

      const expected = 0;
      expect(result).toBeCloseTo(expected);
    });

    it("with point to the left of center returns pi or -pi", () => {
      const circle = new Circle(new Point(3, -4), 5);
      const left_of_center = new Point(1, -4);

      const result = Math.abs(circle.get_angle(left_of_center));

      const expected = Math.PI;
      expect(result).toBeCloseTo(expected);
    });

    it("with point below center returns negative angle", () => {
      const circle = new Circle(new Point(3, -4), 5);
      const point = new Point(1, -6);

      const result = circle.get_angle(point);

      const expected = (-3 * Math.PI) / 4;
      expect(result).toBeCloseTo(expected);
    });

    it("with point above center returns positive angle", () => {
      const circle = new Circle(new Point(3, -4), 5);
      const point = new Point(6, -1);

      const result = circle.get_angle(point);

      const expected = Math.PI / 4;
      expect(result).toBeCloseTo(expected);
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
