import { describe, it, expect } from "vitest";
import { arrays_equal } from "./arrays_equal.js";

describe("arrays_equal", () => {
  it("with two empty arrays returns true", () => {
    const result = arrays_equal([], []);

    expect(result).toBe(true);
  });

  it("with arrays of unequal length returns false", () => {
    const result = arrays_equal([1, 2, 3], [1]);

    expect(result).toBe(false);
  });

  it("with an array and itself returns true", () => {
    const a = [1, 2, 3, 4];

    const result = arrays_equal(a, a);

    expect(result).toBe(true);
  });

  it("with arrays of same length but different values returns false", () => {
    const result = arrays_equal([1, 2, 3], [1, 2, 4]);

    expect(result).toBe(false);
  });

  it("with equal arrays returns true", () => {
    const result = arrays_equal(["foo", "bar", "baz"], ["foo", "bar", "baz"]);

    expect(result).toBe(true);
  });
});
