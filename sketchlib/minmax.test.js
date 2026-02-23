import { describe, it, expect } from "vitest";
import { minmax } from "./minmax.js";

describe("minmax", () => {
  it("with empty array returns undefined", () => {
    const result = minmax([]);

    expect(result).toBeUndefined();
  });

  it("with single value returns that value twice", () => {
    const single_val = [3];

    const result = minmax(single_val);

    const expected = [3, 3];
    expect(result).toEqual(expected);
  });

  it("Computes minimum and maxium value", () => {
    const values = [1, 2, 0, -3, 5, 3, 10];

    const result = minmax(values);

    const expected = [-3, 10];
    expect(result).toEqual(expected);
  });
});
