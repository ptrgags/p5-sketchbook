import { describe, it, expect } from "vitest";
import { range } from "./range.js";

describe("range", () => {
  it("with 0 returns empty iterator", () => {
    const result = [...range(0)];

    const expected = [];
    expect(result).toEqual(expected);
  });

  it("with positive n iterates over the integer", () => {
    const result = [...range(10)];

    const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(result).toEqual(expected);
  });
});
