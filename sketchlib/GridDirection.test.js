import { describe, it, expect } from "vitest";
import { GridDirection } from "./GridDiection";

describe("GridDirection", () => {
  it("LEFT and RIGHT are opposites", () => {
    const left = GridDirection.LEFT;
    const right = GridDirection.RIGHT;

    const left_opp = GridDirection.opposite(left);
    const right_opp = GridDirection.opposite(right);

    expect(left_opp).toBe(right);
    expect(right_opp).toBe(left);
  });

  it("UP and DOWN are opposites", () => {
    const up = GridDirection.UP;
    const down = GridDirection.DOWN;

    const up_opp = GridDirection.opposite(up);
    const down_opp = GridDirection.opposite(down);

    expect(up_opp).toBe(down);
    expect(down_opp).toBe(up);
  });
});
