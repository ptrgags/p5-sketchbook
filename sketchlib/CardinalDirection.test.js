import { describe, it, expect } from "vitest";
import {
  CardinalDirection,
  opposite,
  to_direction,
} from "./CardinalDirection.js";
import { PGA_MATCHERS } from "./test_helpers/pga_matchers.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";

expect.extend(PGA_MATCHERS);

describe("CardinalDirection", () => {
  it("LEFT and RIGHT are opposites", () => {
    const left = CardinalDirection.LEFT;
    const right = CardinalDirection.RIGHT;

    const left_opp = opposite(left);
    const right_opp = opposite(right);

    expect(left_opp).toBe(right);
    expect(right_opp).toBe(left);
  });

  it("UP and DOWN are opposites", () => {
    const up = CardinalDirection.UP;
    const down = CardinalDirection.DOWN;

    const up_opp = opposite(up);
    const down_opp = opposite(down);

    expect(up_opp).toBe(down);
    expect(down_opp).toBe(up);
  });

  describe("to_direction", () => {
    it("RIGHT corresponds to +x", () => {
      const result = to_direction(CardinalDirection.RIGHT);

      expect(result).toBePoint(Direction.DIR_X);
    });

    it("LEFT corresponds to -x", () => {
      const result = to_direction(CardinalDirection.LEFT);

      expect(result).toBePoint(Direction.DIR_X.scale(-1));
    });

    it("UP corresponds to +y", () => {
      const result = to_direction(CardinalDirection.UP);

      expect(result).toBePoint(Direction.DIR_Y);
    });

    it("DOWN corresponds to -y", () => {
      const result = to_direction(CardinalDirection.DOWN);

      expect(result).toBePoint(Direction.DIR_Y.scale(-1));
    });

    it("with undefined returns ZERO", () => {
      const result = to_direction(undefined);

      expect(result).toBePoint(Direction.ZERO);
    });
  });
});
