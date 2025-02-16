import { describe, it, expect } from "vitest";
import { is_nearly } from "./is_nearly";

describe("is_nearly", () => {
  it("returns true if difference is smaller than 1e-8", () => {
    expect(is_nearly(0.1, 0.1000000001)).toBe(true);
  });

  it("returns false if difference is larger than 1e-8", () => {
    expect(is_nearly(0.1, 0.1 + 1.1e-8)).toBe(false);
  });
});
