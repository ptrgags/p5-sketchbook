import { describe, it, expect } from "vitest";

import { Direction } from "./Direction";
import { Point } from "./Point";
import { PGA_MATCHERS } from "./pga_matchers";
import { Line } from "./Line";

expect.extend(PGA_MATCHERS);

describe("Point", () => {
  it("converts to direction", () => {
    const a = new Point(2, -5);

    const result = a.to_direction();

    const expected = new Direction(2, -5);
    expect(result).toBePoint(expected);
  });

  it("gets the underlying x and y components", () => {
    const a = new Point(2, -5);

    expect(a.x).toBe(2);
    expect(a.y).toBe(-5);
  });

  it("adding a direction returns the correct point", () => {
    const a = new Point(1, 2);
    const dir = new Direction(3, 4);

    const result = a.add(dir);

    const expected = new Point(4, 6);
    expect(result).toBePoint(expected);
  });

  it("subtracting points produces the correct direction", () => {
    const a = new Point(1, 4);
    const b = new Point(3, 2);

    const result = a.sub(b);

    const expected = new Direction(-2, 2);
    expect(result).toBePoint(expected);
  });

  it("joining two points gives the line through them", () => {
    const a = new Point(0, 1);
    const b = new Point(1, 0);

    const result = a.join(b);

    const expected = new Line(1, 1, 1);
    expect(result).toBeLine(expected);
  });

  it("swapping join arguments reverses the line's orientation", () => {
    const a = new Point(0, 1);
    const b = new Point(1, 0);

    const result_forward = a.join(b);
    const result_backward = b.join(a);

    const expected_forward = new Line(1, 1, 1);
    const expected_backward = new Line(-1, -1, -1);
    expect(result_forward).toBeLine(expected_forward);
    expect(result_backward).toBeLine(expected_backward);
  });

  it("lerp interpolates two points", () => {
    const a = new Point(1, 2);
    const b = new Point(-2, -8);

    const result = Point.lerp(a, b, 0.25);

    // 3/4 * 1 + 1/4 * -2 = 1/4(3 -2) = 1/4
    // 3/4 * 2 + 1/4 * -8 = 1/4(6 - 8) = -2/4 = -1/2
    const expected = new Point(0.25, -0.5);
    expect(result).toBePoint(expected);
  });

  it("toString formats as point", () => {
    const a = new Point(0.00012345, 2.98763);

    const result = a.toString();

    const expected = "Point(0.000123, 2.99)";
    expect(result).toBe(expected);
  });

  it("flip_y flips y coordinate of points", () => {
    const point = new Point(3, 4);

    const result = point.flip_y();

    const expected = new Point(3, -4);
    expect(result).toBePoint(expected);
  });
});
