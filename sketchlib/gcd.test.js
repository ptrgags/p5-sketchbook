import { describe, it, expect } from "vitest";
import { gcd, lcm } from "./gcd.js";

describe("gcd", () => {
  it("with negative integer throws", () => {
    expect(() => {
      return gcd(-1, 0);
    }).toThrowError("a must be a non-negative integer");

    expect(() => {
      return gcd(0, -1);
    }).toThrowError("b must be a non-negative integer");
  });

  it("with nan throws", () => {
    expect(() => {
      return gcd(NaN, 0);
    }).toThrowError("a must be a non-negative integer");

    expect(() => {
      return gcd(0, NaN);
    }).toThrowError("b must be a non-negative integer");
  });

  it("when one of the numbers is 0, returns the other number", () => {
    const result = gcd(0, 3);

    expect(result).toBe(3);
  });

  it("with coprime numbers returns 1", () => {
    const result = gcd(3, 4);

    expect(result).toBe(1);
  });

  it("with non-coprime numbers returns greatest common divisor", () => {
    const result = gcd(20, 12);

    // 20 = 2^2 * 5
    // 12 = 2^2 * 3
    expect(result).toBe(4);
  });

  it("with the same number returns that number", () => {
    const result = gcd(5, 5);

    expect(result).toBe(5);
  });
});

describe("lcm", () => {
  it("with negative integer throws", () => {
    expect(() => {
      return lcm(-1, 3);
    }).toThrowError("a must be a positive integer");

    expect(() => {
      return lcm(2, -1);
    }).toThrowError("b must be a positive integer");
  });

  it("with nan throws", () => {
    expect(() => {
      return lcm(NaN, 2);
    }).toThrowError("a must be a positive integer");

    expect(() => {
      return lcm(2, NaN);
    }).toThrowError("b must be a positive integer");
  });

  it("with zero throws", () => {
    expect(() => {
      return lcm(0, 2);
    }).toThrowError("a must be a positive integer");

    expect(() => {
      return lcm(2, 0);
    }).toThrowError("b must be a positive integer");
  });

  it("with coprime numbers returns product", () => {
    const result = lcm(3, 4);

    expect(result).toBe(12);
  });

  it("with non-coprime numbers returns least common multiple", () => {
    const result = lcm(20, 12);

    // 20 = 2^2 * 5
    // 12 = 2^2 * 3
    // lcm = 2^2 * 3 * 5 = 60
    expect(result).toBe(60);
  });

  it("with the same number returns that number", () => {
    const result = lcm(4, 4);

    expect(result).toBe(4);
  });
});
