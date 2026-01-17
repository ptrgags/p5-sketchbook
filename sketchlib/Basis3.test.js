import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/Point.js";
import { Direction } from "../pga2d/Direction.js";
import { Basis3 } from "./Basis3.js";
import { PGA_MATCHERS } from "../pga2d/pga_matchers.js";

expect.extend(PGA_MATCHERS);

/**
 * Make an isometric basis
 * @returns {Basis3}
 */
function make_iso_basis() {
  const origin = new Point(32, 64);
  const dx = new Direction(-32, 16);
  const dy = new Direction(32, 16);
  const dz = new Direction(0, -16);

  return new Basis3(origin, dx, dy, dz);
}

describe("Basis3", () => {
  it("position computes absolute screen position", () => {
    const basis = make_iso_basis();

    const result = basis.position(1, 2, 3);

    // (32, 64) + 1 * (-32, 16) + 2 * (32, 16) + 3 * (0, -16)
    // = (32, 64) + (-32, 16) + (64, 32) + (0, -48)
    // =       (0, 80)        +       (64, -16)
    // =                  (64, 64)
    const expected = new Point(64, 64);
    expect(result).toBePoint(expected);
  });

  it("displacement computes relative position", () => {
    const basis = make_iso_basis();

    const result = basis.displacement(1, 2, 3);

    // 1 * (-32, 16) + 2 * (32, 16) + 3 * (0, -16)
    // =   (-32, 16) + (64, 32) + (0, -48)
    // =   (32, 48) + (0, -48)
    // =       (32, 0)
    const expected = new Direction(32, 0);
    expect(result).toBeDirection(expected);
  });
});
