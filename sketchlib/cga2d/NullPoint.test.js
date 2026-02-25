import { describe, it, expect } from "vitest";
import { NullPoint } from "./NullPoint.js";
import { Point } from "../pga2d/Point.js";
import { COdd } from "./COdd.js";
import { CGA_MATCHERS } from "../test_helpers/cga_matchers.js";
import { PGA_MATCHERS } from "../test_helpers/pga_matchers.js";
import { CEven } from "./CEven.js";

expect.extend(CGA_MATCHERS);
expect.extend(PGA_MATCHERS);

describe("NullPoint", () => {
  it("from_point with origin computes correct primitive", () => {
    const result = NullPoint.from_point(Point.ORIGIN);

    // origin is o = 1/2(m - p) = -0.5p + 0.5m
    const expected_vec = new COdd(0, 0, -0.5, 0.5, 0, 0, 0, 0);
    expect(result.vector).toBeCOdd(expected_vec);
    expect(result.point).toBePoint(Point.ORIGIN);
  });

  it("from_point with specific point computes same point as primitive", () => {
    const point = new Point(4, -3);

    const result = NullPoint.from_point(point);

    // point^2 = 16 + 9 = 25
    // 4x -3y + 1/2(25 - 1)p + 1/2(25 + 1)m
    // 4x -3y + 12p + 13m
    const expected_vec = new COdd(4, -3, 12, 13, 0, 0, 0, 0);
    expect(result.vector).toBeCOdd(expected_vec);
    expect(result.point).toBePoint(point);
  });

  it("transform with odd versor transforms point", () => {
    const point = NullPoint.from_point(new Point(4, -3));
    const flip_x = new COdd(2, 0, 0, 0, 0, 0, 0, 0);

    const result = point.transform(flip_x);

    // we expect the point x = (-4, -3)
    // x^2 = 16 + 9 = 25
    // 1/2(x^2 - 1)p + 1/2(x^2 + 1)m
    // 1/2(25 - 1)p + 1/2(25 + 1)m
    // 12p + 13m
    const expected_vec = new COdd(-4, -3, 12, 13, 0, 0, 0, 0);
    const expected_point = new Point(-4, -3);
    expect(result.vector).toBeCOdd(expected_vec);
    expect(result.point).toBePoint(expected_point);
  });

  it("transform with even versor transforms point", () => {
    const point = NullPoint.from_point(new Point(4, -3));
    const rot180 = new CEven(0, 1, 0, 0, 0, 0, 0, 0);

    const result = point.transform(rot180);

    // we expect the point x = (-4, 3)
    // x^2 = 4^2 + 3^2 = 25
    // 1/2(x^2 - 1)p + 1/2(x^2 + 1)m
    // = 1/2(24)p + 1/2(26)m
    // = 12p + 13m
    const expected_vec = new COdd(-4, 3, 12, 13, 0, 0, 0, 0);
    const expected_point = new Point(-4, 3);
    expect(result.vector).toBeCOdd(expected_vec);
    expect(result.point).toBePoint(expected_point);
  });

  it("INF.point is undefined", () => {
    const result = NullPoint.INF.point;

    expect(result).toBeUndefined();
  });
});
