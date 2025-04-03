import { describe, it, expect } from "vitest";
import { Direction, opposite, to_pga_direction } from "./Direction.js";
import { Point } from "../pga2d/objects.js";
import { PGA_MATCHERS } from "../pga2d/pga_matchers";

expect.extend(PGA_MATCHERS);

describe("Direction", () => {
  it("LEFT and RIGHT are opposites", () => {
    const left = Direction.LEFT;
    const right = Direction.RIGHT;

    const left_opp = opposite(left);
    const right_opp = opposite(right);

    expect(left_opp).toBe(right);
    expect(right_opp).toBe(left);
  });

  it("UP and DOWN are opposites", () => {
    const up = Direction.UP;
    const down = Direction.DOWN;

    const up_opp = opposite(up);
    const down_opp = opposite(down);

    expect(up_opp).toBe(down);
    expect(down_opp).toBe(up);
  });

  describe("to_pga_direction", () => {
    it("RIGHT corresponds to +x", () => {
      const result = to_pga_direction(Direction.RIGHT);

      expect(result).toBePoint(Point.DIR_X);
    });

    it("LEFT corresponds to -x", () => {
      const result = to_pga_direction(Direction.LEFT);

      expect(result).toBePoint(Point.DIR_X.scale(-1));
    });

    it("UP corresponds to +y", () => {
      const result = to_pga_direction(Direction.UP);

      expect(result).toBePoint(Point.DIR_Y);
    });

    it("DOWN corresponds to -y", () => {
      const result = to_pga_direction(Direction.DOWN);

      expect(result).toBePoint(Point.DIR_Y.scale(-1));
    });
  });
});
