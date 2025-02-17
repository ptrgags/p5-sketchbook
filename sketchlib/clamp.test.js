import { describe, it, expect } from "vitest";
import { clamp } from "./clamp";

describe("clamp", () => {
  it("with x in range returns x", () => {
    const x = 0.5;
    const min = 0.0;
    const max = 1.0;

    const result = clamp(x, min, max);

    expect(result).toBe(x);
  });

  it("with x smaller than min returns min", () => {
    const x = -1.0;
    const min = 0.0;
    const max = 1.0;

    const result = clamp(x, min, max);

    expect(result).toBe(min);
  });

  it("with x larger than max returns max", () => {
    const x = 2.0;
    const min = 0.0;
    const max = 1.0;

    const result = clamp(x, min, max);

    expect(result).toBe(max);
  });
});
