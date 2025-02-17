import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/objects";
import { BezierPrimitive } from "./primitives";
import { PGA_MATCHERS } from "../pga2d/pga_matchers";

expect.extend(PGA_MATCHERS);

describe("BezierPrimitive", () => {
  it("from_b_spline computes correct control points for square", () => {
    const a = Point.point(0, 0);
    const b = Point.point(1, 0);
    const c = Point.point(1, 1);
    const d = Point.point(0, 1);

    const result = BezierPrimitive.from_b_spline(a, b, c, d);

    // 1/6((0, 0) + 4(1, 0) + (1, 1)) = 1/6(5, 1) = (5/6, 1/6)
    const expected_a = Point.point(5 / 6, 1 / 6);
    // Middle points are 1/3 and 2/3 across line from b -> c
    const expected_b = Point.point(1, 1 / 3);
    const expected_c = Point.point(1, 2 / 3);
    // 1/6((1, 0) + 4(1, 1) + (0, 1)) = 1/6(5, 5) = (5/6, 5/6)
    const expected_d = Point.point(5 / 6, 5 / 6);
    expect(result.a).toBePoint(expected_a);
    expect(result.b).toBePoint(expected_b);
    expect(result.c).toBePoint(expected_c);
    expect(result.d).toBePoint(expected_d);
  });
});
