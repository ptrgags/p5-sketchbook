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

    it("infinity is stored as 1/0", () => {
      const inf = Rational.INF;

      expect(inf.numerator).toBe(1);
      expect(inf.denominator).toBe(0);
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

  describe("sub", () => {
    it("computes subtraction with common denominator", () => {
      const a = new Rational(1, 8);
      const b = new Rational(2, 8);

      const result = b.sub(a);

      const expected = new Rational(1, 8);
      expect(result).toEqual(expected);
    });

    it.todo("computes subtraction with different denominators");

    it.todo("subtraction of inf and inf throws error");
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

  describe("mul", () => {
    it("computes product in lowest terms", () => {
      const a = new Rational(-3, 4);
      const b = new Rational(1, 3);

      const result = a.mul(b);

      // -3/4 * 1/3 = -3/12 = -1/4
      const expected = new Rational(-1, 4);
      expect(result).toEqual(expected);
    });

    it("0 times infinity throws error", () => {
      const a = Rational.INF;
      const b = Rational.ZERO;
      expect(() => {
        return a.mul(b);
      }).toThrowError("cannot divide 0 by 0");
    });

    it("inf times inf returns inf", () => {
      const result = Rational.INF.mul(Rational.INF);

      expect(result).toEqual(Rational.INF);
    });
  });

  describe("max", () => {
    it("max of number and itself is same number", () => {
      const a = new Rational(2, 3);

      const result = a.max(a);

      expect(result).toBe(a);
    });

    it("with two positive numbers returns correct maximum", () => {
      const a = new Rational(2, 3);
      const b = new Rational(3, 2);

      const result = a.max(b);

      expect(result).toBe(b);
    });

    it("with two negative numbers returns correct maximum", () => {
      const a = new Rational(-5, 6);
      const b = new Rational(-3, 5);

      const result = a.max(b);

      expect(result).toBe(b);
    });

    it("with negative and positive numbers returns positive one", () => {
      const a = new Rational(5, 6);
      const b = new Rational(-3, 5);

      const result = a.max(b);

      expect(result).toBe(a);
    });
  });

  describe("equals", () => {
    it("a rational number equals itself", () => {
      const a = new Rational(-2, 3);

      const result = a.equals(a);

      expect(result).toBe(true);
    });

    it("with two equivalent fractions returns true", () => {
      const a = new Rational(2, 3);
      const b = new Rational(4, 6);

      const result = a.equals(b);

      expect(result).toBe(true);
    });

    it("with two different fractions returns false", () => {
      const a = new Rational(3, 4);
      const b = new Rational(-2, 3);

      const result = a.equals(b);

      expect(result).toBe(false);
    });
  });
});
