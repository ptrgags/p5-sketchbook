import { describe, it, expect } from "vitest";
import { BezierPrimitive } from "./BezierPrimitive";
import { PGA_MATCHERS } from "../../pga2d/pga_matchers";
import { Point } from "../../pga2d/Point";

expect.extend(PGA_MATCHERS);

describe("BezierPrimitive", () => {
  it("from_b_spline computes correct control points for square", () => {
    const a = new Point(0, 0);
    const b = new Point(1, 0);
    const c = new Point(1, 1);
    const d = new Point(0, 1);

    const result = BezierPrimitive.from_b_spline(a, b, c, d);

    // 1/6((0, 0) + 4(1, 0) + (1, 1)) = 1/6(5, 1) = (5/6, 1/6)
    const expected_a = new Point(5 / 6, 1 / 6);
    // Middle points are 1/3 and 2/3 across line from b -> c
    const expected_b = new Point(1, 1 / 3);
    const expected_c = new Point(1, 2 / 3);
    // 1/6((1, 0) + 4(1, 1) + (0, 1)) = 1/6(5, 5) = (5/6, 5/6)
    const expected_d = new Point(5 / 6, 5 / 6);
    expect(result.a).toBePoint(expected_a);
    expect(result.b).toBePoint(expected_b);
    expect(result.c).toBePoint(expected_c);
    expect(result.d).toBePoint(expected_d);
  });
});
