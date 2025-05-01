import { describe, it, expect } from "vitest";
import { Rational } from "./Rational.js";

describe("Rational", () => {
  describe("constructor", () => {
    it("throws for 0/0", () => {
      expect(() => {
        return new Rational(0, 0);
      }).toThrowError("cannot divide 0 by 0");
    });

    it("constructor reduces number to lowest terms", () => {
      const rational = new Rational(4, 12);

      const expected = new Rational(1, 3);
      expect(rational).toEqual(expected);
    });
  });

  describe("add", () => {
    it("computes addition with common denominator", () => {
      const a = new Rational(1, 8);
      const b = new Rational(2, 8);

      const result = a.add(b);

      const expected = new Rational(3, 8);
      expect(result).toEqual(expected);
    });

    it("computes addition with different denominators", () => {
      const a = new Rational(2, 10);
      const b = new Rational(3, 5);

      const result = a.add(b);

      // 2/10 + 3/5 = 2/10 + 6/10 = 8/10 = 4/5
      const expected = new Rational(4, 5);
      expect(result).toEqual(expected);
    });

    it("addition of +/- infinity throws for 0/0", () => {
      const a = Rational.INF;
      const b = Rational.NEG_INF;
      expect(() => {
        return a.add(b);
      }).toThrowError("cannot divide 0 by 0");
    });
  });

  describe("quotient and remainder", () => {
    it("quotient returns the integer quotient", () => {
      const a = new Rational(7, 5);

      const result = a.quotient;

      // 7/5 = 1 remainder 2
      const expected = 1;
      expect(result).toBe(expected);
    });

    it("remainder returns the integer remainder", () => {
      const a = new Rational(7, 5);

      const result = a.remainder;

      const expected = 2;
      expect(result).toBe(expected);
    });

    it("remainder of negative rational is positive", () => {
      const a = new Rational(-7, 5);

      const result = a.remainder;

      const expected = 3;
      expect(result).toBe(expected);
    });
  });
});
