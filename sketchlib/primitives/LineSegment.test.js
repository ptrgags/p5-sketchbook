import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/Point.js";
import { LineSegment } from "./LineSegment.js";
import { Direction } from "../pga2d/Direction.js";

describe("LineSegment", () => {
  it("arc_length returns length of line", () => {
    const start = new Point(2, -1);
    const end = start.add(new Direction(3, 4));
    const segment = new LineSegment(start, end);

    const result = segment.arc_length;

    const expected = 5;
    expect(result).toEqual(expected);
  });

  describe("get_arc_length", () => {
    // line segment outlining a 3-4-5 triangle
    const start = new Point(2, -1);
    const end = start.add(new Direction(3, 4));
    const segment = new LineSegment(start, end);

    it("with 0 returns 0", () => {
      const result = segment.get_arc_length(0);

      const expected = 0;
      expect(result).toEqual(expected);
    });

    it("with 1 returns length", () => {
      const result = segment.get_arc_length(1);

      const expected = 5;
      expect(result).toEqual(expected);
    });

    it("with 0.5 returns half of the length", () => {
      const result = segment.get_arc_length(0.5);

      const expected = 5 / 2;
      expect(result).toEqual(expected);
    });
  });

  describe("get_t", () => {
    // line segment outlining a 3-4-5 triangle
    const start = new Point(2, -1);
    const end = start.add(new Direction(3, 4));
    const segment = new LineSegment(start, end);

    it("with 0 returns 0", () => {
      const result = segment.get_t(0);

      const expected = 0;
      expect(result).toEqual(expected);
    });

    it("with arc length returns 1", () => {
      const result = segment.get_t(5);

      const expected = 1;
      expect(result).toEqual(expected);
    });

    it("with half arc length returns 0.5", () => {
      const result = segment.get_t(5 / 2);

      const expected = 0.5;
      expect(result).toEqual(expected);
    });
  });
});
