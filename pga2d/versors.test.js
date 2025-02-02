import { describe, it, expect } from "vitest";
import { Line, Point, Direction } from "./objects";
import { Flector } from "./versors";

describe("Flector", () => {
  describe("reflection", () => {
    it("reflects point in a line", () => {
      const point = new Point(3, 4);
      const line = new Line(1, -1, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(point);

      const expected = new Point(4, 3);
      expect(result).toEqual(expected);
    });

    it("reflects direction in a line", () => {
      const direction = new Direction(1, 2);
      const line = new Line(1, -1, 0);
      const reflection = Flector.reflection(line);

      const result = reflection.transform(direction);

      const expected = new Direction(2, 1);
      expect(result).toEqual(expected);
    });
  });
});
