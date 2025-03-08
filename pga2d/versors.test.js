import { describe, it, expect } from "vitest";
import { Line, Point } from "./objects";
import { Motor, Flector } from "./versors";
import { PGA_MATCHERS } from "./pga_matchers";

expect.extend(PGA_MATCHERS);

// Numeric values are computed using kingdon, see my other repo math-notebook

describe("Motor", () => {
  describe("rotation", () => {
    it("reverse of a rotation in the origin is its inverse", () => {
      const test_point = Point.point(1, -2);
      const rotation = Motor.rotation(Point.ORIGIN, Math.PI / 3);

      const inverse = rotation.reverse();
      const forward_backward = inverse.transform_point(
        rotation.transform_point(test_point)
      );
      const backward_forward = rotation.transform_point(
        inverse.transform_point(test_point)
      );

      expect(forward_backward).toBePoint(backward_forward);
    });

    it("Rotates points counterclockwise", () => {
      const center = Point.point(1, -2);
      const rotation = Motor.rotation(center, Math.PI / 3);
      const point = Point.point(1, 0);

      const result = rotation.transform_point(point);

      // The point gets rotated a little bit past the y-axis into quadrant III
      const expected = Point.point(-0.732050807, -1);
      expect(result).toBePoint(expected);
    });
  });
});

describe("Flector", () => {
  describe("reflection", () => {
    it("reflection in y-axis flips x-component", () => {
      const point = Point.point(3, 4);
      const line = new Line(1, 0, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform_point(point);

      const expected = Point.point(-3, 4);
      expect(result).toBePoint(expected);
      expect(result.equals(expected)).toBe(true);
    });

    it("reflection in x-axis flips y-component", () => {
      const point = Point.point(3, 4);
      const line = new Line(0, 1, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform_point(point);

      const expected = Point.point(3, -4);
      expect(result).toBePoint(expected);
    });

    it("reflection in plane at infinity returns 0", () => {
      const point = Point.point(3, 4);
      const line = new Line(0, 0, 1);
      const reflection = Flector.reflection(line);

      const result = reflection.transform_point(point);

      const expected = Point.ZERO;
      expect(result).toBePoint(expected);
    });

    it("reflecting twice leaves point unchanged", () => {
      const point = Point.point(3, 4);
      const line = new Line(1, 2, 3);
      const reflection = Flector.reflection(line);

      const reflect_once = reflection.transform_point(point);
      const result = reflection.transform_point(reflect_once);

      expect(result).toBePoint(point);
    });

    it("reflects point in a line", () => {
      const point = Point.point(3, 4);
      const line = new Line(1, -1, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform_point(point);

      const expected = Point.point(4, 3);
      expect(result).toBePoint(expected);
    });

    it("reflects direction in a line", () => {
      const direction = Point.direction(1, 2);
      const line = new Line(1, -1, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform_point(direction);

      // Note: bivectors are inverted in the mirror. Since this is
      // an ideal direction, the minus sign doesn't get normalized hence
      // the negative coefficients here
      const expected = Point.direction(-2, -1);
      expect(result).toBePoint(expected);
    });
  });
});
