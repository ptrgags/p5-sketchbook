import { describe, it, expect } from "vitest";
import { lerp } from "./lerp";

describe("lerp", () => {
  it("with t < 0 extrapolates", () => {
    let a = 1;
    let b = 5;

    let result = lerp(a, b, -1);

    // (1 - -1) * 1 - 1 * 5 = 2 - 5 = -3
    const expected = -3;
    expect(result).toBe(expected);
  });

  it("with t = 0 returns a", () => {
    let a = 1;
    let b = 5;

    let result = lerp(a, b, 0);

    expect(result).toBe(a);
  });

  it("with t in between interpolates", () => {
    let a = 1;
    let b = 5;

    let result = lerp(a, b, 0.25);

    // 3/4 * 1 + 1/4 * 5 = (3 + 5)/4 = 8/4 = 2
    const expected = 2;
    expect(result).toBe(expected);
  });

  it("with t = 1 returns b", () => {
    let a = 1;
    let b = 5;

    let result = lerp(a, b, 1);

    expect(result).toBe(b);
  });

  it("with t > 1 extrapolates", () => {
    let a = 1;
    let b = 5;

    let result = lerp(a, b, 2);

    // (1 - 2) * 1 + 2 * 5 = -1 + 10 = 9
    const expected = 9;
    expect(result).toBe(expected);
  });

  it("with a = b returns a", () => {
    let a = 1;

    let result = lerp(a, a, 0.75);

    expect(result).toBe(a);
  });
});
