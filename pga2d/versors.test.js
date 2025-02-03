import { describe, it, expect } from "vitest";
import { Line, Point, Direction } from "./objects";
import { Flector } from "./versors";

describe("Flector", () => {
  describe("reflection", () => {
    it("reflection in y-axis flips x-component", () => {
      const point = new Point(3, 4);
      const line = new Line(1, 0, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(point);

      const expected = new Point(-3, 4);
      expect(result.equals(expected)).toBe(true);
    });

    it("reflection in x-axis flips y-component", () => {
      const point = new Point(3, 4);
      const line = new Line(0, 1, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(point);

      const expected = new Point(3, -4);
      expect(result.equals(expected)).toBe(true);
    });

    it("reflection in plane at infinity returns 0", () => {
      const point = new Point(3, 4);
      const line = new Line(0, 0, 1);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(point);

      const expected = new Direction(0, 0);
      expect(result.equals(expected)).toBe(true);
    });

    it("reflecting twice leaves point unchanged", () => {
      const point = new Point(3, 4);
      const line = new Line(1, 2, 3);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(reflection.transform(point));

      expect(result.equals(point)).toBe(true);
    });

    it("reflects point in a line", () => {
      const point = new Point(3, 4);
      const line = new Line(1, -1, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(point);

      const expected = new Point(4, 3);
      expect(result.equals(expected)).toBe(true);
    });

    it("reflects direction in a line", () => {
      const direction = new Direction(1, 2);
      const line = new Line(1, -1, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(direction);

      const expected = new Direction(2, 1);
      expect(result.equals(expected)).toBe(true);
    });
  });
});
