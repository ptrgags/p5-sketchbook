import { describe, it, expect } from "vitest";
import { PiecewiseLinear } from "./PiecewiseLinear";

describe("PiecewiseLinear", () => {
  it("with no points throws error", () => {
    expect(() => {
      return new PiecewiseLinear([]);
    }).toThrowError("points must have at least one entry!");
  });

  it("with one point returns constant", () => {
    const curve = new PiecewiseLinear([[4, 3]]);

    const result = curve.value(2.0);

    expect(result).toBe(3);
  });

  it("with value smaller than first x clamps", () => {
    const curve = new PiecewiseLinear([
      [2.5, 0.25],
      [3.0, 0.5],
      [5.0, 0.75],
    ]);

    const result = curve.value(1.0);

    expect(result).toBe(0.25);
  });

  it("with value larger than last x clamps", () => {
    const curve = new PiecewiseLinear([
      [2.5, 0.25],
      [3.0, 0.5],
      [5.0, 0.75],
    ]);

    const result = curve.value(8.0);

    expect(result).toBe(0.75);
  });

  it("with value exactly at the last x clamps", () => {
    const curve = new PiecewiseLinear([
      [2.5, 0.25],
      [3.0, 0.5],
      [5.0, 0.75],
    ]);

    const result = curve.value(5.0);

    expect(result).toBe(0.75);
  });

  it("with value at point returns correct value", () => {
    const curve = new PiecewiseLinear([
      [2.5, 0.25],
      [3.0, 0.5],
      [5.0, 0.75],
    ]);

    const result = curve.value(3.0);

    expect(result).toBeCloseTo(0.5);
  });

  it("with value in between returns correct value", () => {
    const curve = new PiecewiseLinear([
      [2.5, 0.25],
      [3.0, 0.5],
      [5.0, 0.75],
    ]);

    const result = curve.value(4.5);

    // should be lerp(0.5, 0.75, (4.5-3)/(5-3)) = 0.6875
    expect(result).toBeCloseTo(0.6875);
  });
});
