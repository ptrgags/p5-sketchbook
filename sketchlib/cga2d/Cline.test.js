import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/Point.js";
import { Cline } from "./Cline.js";
import { COdd } from "./COdd.js";
import { CGA_MATCHERS } from "../test_helpers/cga_matchers.js";
import { PGA_MATCHERS } from "../test_helpers/pga_matchers.js";
import { Line } from "../pga2d/Line.js";

expect.extend(CGA_MATCHERS);
expect.extend(PGA_MATCHERS);

describe("Cline", () => {
  it("from_point with origin computes correct primitive", () => {
    const result = Cline.from_point(Point.ORIGIN);

    // origin is o = 1/2(m - p) = -0.5p + 0.5m
    const expected_vec = new COdd(0, 0, -0.5, 0.5, 0, 0, 0, 0);
    expect(result.vector).toBeCOdd(expected_vec);
    expect(result.primitive).toBePoint(Point.ORIGIN);
  });

  it("from_point with specific point computes same point as primitive", () => {
    const point = new Point(4, -3);

    const result = Cline.from_point(point);

    // point^2 = 16 + 9 = 25
    // 4x -3y + 1/2(25 - 1)p + 1/2(25 + 1)m
    // 4x -3y + 12p + 13m
    const expected_vec = new COdd(4, -3, 12, 13, 0, 0, 0, 0);
    expect(result.vector).toBeCOdd(expected_vec);
    expect(result.primitive).toBePoint(point);
  });

  it("from_line with x-axis computes correct line", () => {
    const result = Cline.from_line(Line.X_AXIS);

    // x-axis is the vector 1y
    const expected_vec = new COdd(0, 1, 0, 0, 0, 0, 0, 0);
    expect(result.vector).toBeCOdd(expected_vec);
    expect(result.primitive).toEqual(Line.X_AXIS);
  });

  it("from_line with arbitrary line computes correct line", () => {
    const line = new Line(3 / 5, 4 / 5, 7);

    const result = Cline.from_line(line);

    // n = (3/5, 4/5), d = 57
    // n + d inf
    // = 3/5 x + 4/5y + 7(m + p)
    // = 3/5 x + 4/5y + 7p + 7m
    const expected_vec = new COdd(3 / 5, 4 / 5, 7, 7, 0, 0, 0, 0);
    expect(result.vector).toBeCOdd(expected_vec);
    expect(result.primitive).toEqual(line);
  });
});
