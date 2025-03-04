import { describe, it, expect } from "vitest";
import { Line, Point } from "./objects";
import { Motor, Flector } from "./versors";
import { PGA_MATCHERS } from "./pga_matchers";

expect.extend(PGA_MATCHERS);

describe("Motor", () => {
  describe("rotation", () => {
    it("reverse of a rotation in the origin is its inverse", () => {
      const test_point = Point.point(1, -2);
      const rotation = Motor.rotation(Point.ZERO, Math.PI / 3);

      const inverse = rotation.reverse();
      const forward_backward = inverse.transform(
        rotation.transform(test_point)
      );
      const backward_forward = rotation.transform(
        inverse.transform(test_point)
      );

      expect(forward_backward).toBePoint(backward_forward);
    });
  });
});

describe("Flector", () => {
  describe("reflection", () => {
    it("reflection in y-axis flips x-component", () => {
      const point = Point.point(3, 4);
      const line = new Line(1, 0, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(point);

      const expected = Point.point(-3, 4);
      expect(result).toBePoint(expected);
      expect(result.equals(expected)).toBe(true);
    });

    it("reflection in x-axis flips y-component", () => {
      const point = Point.point(3, 4);
      const line = new Line(0, 1, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(point);

      const expected = Point.point(3, -4);
      expect(result).toBePoint(expected);
    });

    it("reflection in plane at infinity returns 0", () => {
      const point = Point.point(3, 4);
      const line = new Line(0, 0, 1);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(point);

      const expected = Point.ZERO;
      expect(result).toBePoint(expected);
    });

    it("reflecting twice leaves point unchanged", () => {
      const point = Point.point(3, 4);
      const line = new Line(1, 2, 3);
      const reflection = Flector.reflection(line);

      const reflect_once = reflection.transform(point);
      const result = reflection.transform(reflect_once);

      expect(result).toBePoint(point);
    });

    it("reflects point in a line", () => {
      const point = Point.point(3, 4);
      const line = new Line(1, -1, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(point);

      const expected = Point.point(4, 3);
      expect(result).toBePoint(expected);
    });

    it("reflects direction in a line", () => {
      const direction = Point.direction(1, 2);
      const line = new Line(1, -1, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(direction);

      // Note: bivectors are inverted in the mirror. Since this is
      // an ideal direction, the minus sign doesn't get normalized hence
      // the negative coefficients here
      const expected = Point.direction(-2, -1);
      expect(result).toBePoint(expected);
    });
  });
});
