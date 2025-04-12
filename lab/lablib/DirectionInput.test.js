import { describe, it, expect } from "vitest";
import { DirectionInput } from "./DirectionInput.js";
import { Direction } from "../../sketchlib/Direction.js";
import { Point } from "../../pga2d/objects.js";

describe("DirectionInput", () => {
  describe("first_nonzero", () => {
    it("With two NO_INPUTs, returns NO_INPUT", () => {
      const identity = DirectionInput.NO_INPUT;

      const result = DirectionInput.first_nonzero(identity, identity);

      expect(result).toBe(identity);
    });

    it("NO_INPUT is the identity", () => {
      const identity = DirectionInput.NO_INPUT;
      const right_pressed = new DirectionInput(Direction.RIGHT, Point.DIR_X);

      const id_right = DirectionInput.first_nonzero(identity, right_pressed);
      const right_id = DirectionInput.first_nonzero(right_pressed, identity);

      expect(id_right).toBe(right_pressed);
      expect(right_id).toBe(right_pressed);
    });

    it("With two inputs returns the first one", () => {
      const right_pressed = new DirectionInput(Direction.RIGHT, Point.DIR_X);
      const down_pressed = new DirectionInput(Direction.DOWN, Point.DIR_Y);

      const result = DirectionInput.first_nonzero(right_pressed, down_pressed);
      expect(result).toBe(right_pressed);
    });

    it("is associative", () => {
      const a = new DirectionInput(Direction.RIGHT, Point.DIR_X);
      const b = new DirectionInput(Direction.DOWN, Point.DIR_Y);
      const c = new DirectionInput(Direction.LEFT, Point.DIR_X.neg());

      const ab_c = DirectionInput.first_nonzero(
        DirectionInput.first_nonzero(a, b),
        c
      );
      const a_bc = DirectionInput.first_nonzero(
        a,
        DirectionInput.first_nonzero(b, c)
      );

      expect(ab_c).toBe(a_bc);
      expect(ab_c).toBe(a);
    });
  });
});
