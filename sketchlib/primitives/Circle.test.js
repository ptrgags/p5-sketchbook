import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/Point.js";
import { Circle } from "./Circle.js";

describe("CirclePrimitive", () => {
  describe("from_two_points", () => {
    it("with identical points returns degenerate circle", () => {
      const a = new Point(1, 2);

      const result = Circle.from_two_points(a, a);

      const expected = new Circle(new Point(1, 2), 0);
      expect(result).toEqual(expected);
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
      expect(result).toEqual(expected);
    });
  });
});
