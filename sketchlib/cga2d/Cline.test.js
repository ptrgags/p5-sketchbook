import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/Point.js";
import { Cline } from "./Cline.js";
import { COdd } from "./COdd.js";
import { CGA_MATCHERS } from "../test_helpers/cga_matchers.js";
import { PGA_MATCHERS } from "../test_helpers/pga_matchers.js";
import { Line } from "../pga2d/Line.js";
import { Circle } from "../primitives/Circle.js";

expect.extend(CGA_MATCHERS);
expect.extend(PGA_MATCHERS);

describe("Cline", () => {
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

  it("from_circle with unit circle computes correct primitive", () => {
    const circle = Circle.UNIT_CIRCLE;

    const result = Cline.from_circle(circle);

    // A = center^2 - r^2 = 0 - 1 = -1
    // circle = center + 1/2(A - 1)p + 1/2(A + 1)m
    // = 0 + 1/2(-1 - 1)p + 1/2(-1 + 1)m
    // = -p
    const expected_vec = new COdd(0, 0, -1, 0, 0, 0, 0, 0);
    expect(result.vector).toBeCOdd(expected_vec);
    expect(result.primitive).toEqual(circle);
  });

  it("from_circle with arbitrary circle computes correct primitive", () => {
    const circle = new Circle(new Point(1, -2), 10);

    const result = Cline.from_circle(circle);

    // A = center^2 - r^2 = 1^2 + (-2)^2 - 10^2 = 1 + 4 - 100 = -95
    // circle = center + 1/2(A - 1)p + 1/2 (A + 1)m
    // = 1x -2y + 1/2(-95-1)p + 1/2(-95 + 1)m
    // = 1x -2y -48p + -47m
    const expected_vec = new COdd(1, -2, -48, -47, 0, 0, 0, 0);
    expect(result.vector).toBeCOdd(expected_vec);
    expect(result.primitive).toEqual(circle);
  });
});
