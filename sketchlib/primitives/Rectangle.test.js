import { describe, it, expect } from "vitest";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Rectangle } from "./Rectangle.js";
import { PGA_MATCHERS } from "../test_helpers/pga_matchers.js";

expect.extend(PGA_MATCHERS);

describe("Rectangle", () => {
  it("center computes center", () => {
    const rect = new Rectangle(new Point(-3, 5), new Direction(5, 3));

    const result = rect.center;

    const expected = new Point(-0.5, 6.5);
    expect(result).toBePoint(expected);
  });

  describe("contains", () => {
    it("with point inside rectangle returns true", () => {
      const rect = new Rectangle(new Point(1, 2), new Direction(4, 5));
      const point = new Point(2, 3);

      const result = rect.contains(point);

      const expected = true;
      expect(result).toEqual(expected);
    });

    it("with point outside side returns false", () => {
      const rect = new Rectangle(new Point(1, 2), new Direction(4, 5));
      const point = new Point(-2, 3);

      const result = rect.contains(point);

      const expected = false;
      expect(result).toEqual(expected);
    });

    it("with point outside corner returns false", () => {
      const rect = new Rectangle(new Point(1, 2), new Direction(4, 5));
      const point = new Point(-2, 3);

      const result = rect.contains(point);

      const expected = false;
      expect(result).toEqual(expected);
    });

    // point outside far corner = true
    // point outside far side = true
    // point on near boundary = true
    // point on far boundary = false (??)
  });
});
