import { describe, it, expect } from "vitest";
import { mod } from "./mod";

describe("mod", () => {
  it("0 mod anything is zero", () => {
    const x = 0;
    const m = 5;

    const result = mod(x, m);

    expect(result).toBe(0);
  });

  it("positive modulo positive returns positive value", () => {
    const x = 8;
    const m = 5;

    const result = mod(x, m);

    expect(result).toBe(3);
  });

  it("negative modulo positive returns positive value", () => {
    const x = -3;
    const m = 5;

    const result = mod(x, m);

    // I want this to be 2, not -3
    expect(result).toBe(2);
  });
});
