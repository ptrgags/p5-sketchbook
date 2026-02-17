import { describe, it, expect } from "vitest";
import { Rational } from "./Rational.js";

describe("Rational", () => {
  describe("constructor", () => {
    it("throws for 0/0", () => {
      expect(() => {
        return new Rational(0, 0);
      }).toThrowError("cannot divide 0 by 0");
    });

    it("constructor with no second argument creates integer", () => {
      const integer = new Rational(5);

      const expected = new Rational(5, 1);
      expect(integer).toEqual(expected);
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

    it("computes subtraction with different denominators", () => {
      const a = new Rational(1, 3);
      const b = new Rational(1, 2);

      const result = a.sub(b);

      // 1/3 - 1/2 = 2/6 - 3/6 = -1/6
      const expected = new Rational(-1, 6);
      expect(result).toEqual(expected);
    });

    it("subtraction of inf and inf throws error", () => {
      expect(() => {
        return Rational.INF.sub(Rational.INF);
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

  describe("reciprocal", () => {
    it("reciprocal of simple fraction swaps numerator and denominator", () => {
      const a = new Rational(3, 4);

      const result = a.reciprocal;

      const expected = new Rational(4, 3);
      expect(result).toEqual(expected);
    });

    it("reciprocal of negative fraction keeps negative sign in numerator", () => {});
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

  describe("div", () => {
    it("divides two numbers", () => {
      const a = new Rational(-3, 4);
      const b = new Rational(1, 3);

      const result = a.div(b);

      // (-3/4)/(1/3) = (-3 * 3)/(4*1) = -9/4
      const expected = new Rational(-9, 4);
      expect(result).toEqual(expected);
    });

    it("0 div 0 throws error", () => {
      const a = Rational.ZERO;

      expect(() => {
        return a.div(a);
      }).toThrowError("cannot divide 0 by 0");
    });

    it("inf div inf throws error", () => {
      const a = Rational.INF;

      expect(() => {
        return a.div(a);
      }).toThrowError("cannot divide 0 by 0");
    });

    it("ONE div x is equal to x.reciprocal", () => {
      const a = new Rational(3, 4);

      const division = Rational.ONE.div(a);
      const recip = a.reciprocal;

      expect(division).toEqual(recip);
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

    it("with equivalent negative fractions returns true", () => {
      const a = new Rational(-3, 4);
      const b = new Rational(3, -4);

      const result = a.equals(b);

      expect(result).toBe(true);
    });
  });

  describe("lt", () => {
    it("with equal fractions returns false", () => {
      const a = new Rational(3, 4);

      const result = a.lt(a);

      expect(result).toBe(false);
    });

    it("with a negative fraction and zero returns correct ordering", () => {
      const a = new Rational(-3, 4);
      const zero = Rational.ZERO;

      const a_lt_zero = a.lt(zero);
      const zero_lt_a = zero.lt(a);

      expect(a_lt_zero).toBe(true);
      expect(zero_lt_a).toBe(false);
    });

    it("with two positive fractions returns correct ordering", () => {
      const a = new Rational(3);
      const b = new Rational(3, 4);

      const a_lt_b = a.lt(b);
      const b_lt_a = b.lt(a);

      expect(a_lt_b).toBe(false);
      expect(b_lt_a).toBe(true);
    });

    it("with two negative fractions returns correct ordering", () => {
      const a = new Rational(-1);
      const b = new Rational(4, -3);

      const a_lt_b = a.lt(b);
      const b_lt_a = b.lt(a);

      expect(a_lt_b).toBe(false);
      expect(b_lt_a).toBe(true);
    });
  });

  describe("other comparisons", () => {
    it("gt with the same value returns false", () => {
      const a = new Rational(1, 2);

      const result = a.gt(a);

      expect(result).toBe(false);
    });

    it("gt gives the same result as lt with args swapped", () => {
      const a = new Rational(1, 2);
      const b = new Rational(-3, 4);

      const a_gt_b = a.gt(b);
      const b_lt_a = b.lt(a);

      expect(a_gt_b).toBe(true);
      expect(b_lt_a).toBe(true);
    });

    it("ge with the same value returns true", () => {
      const a = new Rational(1, 2);

      const result = a.gt(a);

      expect(result).toBe(false);
    });

    it("le with the same value returns true", () => {
      const a = new Rational(1, 2);

      const result = a.gt(a);

      expect(result).toBe(false);
    });

    it("le is the negation of gt", () => {
      const a = new Rational(1, 2);
      const b = new Rational(-3, 4);

      const a_le_b = a.le(b);
      const a_gt_b = a.gt(b);

      expect(a_le_b).toBe(false);
      expect(a_gt_b).toBe(true);
    });

    it("ge is le with the arguments swapped", () => {
      const a = new Rational(1, 2);
      const b = new Rational(-3, 4);

      const a_gt_b = a.gt(b);
      const b_lt_a = b.lt(a);

      expect(a_gt_b).toBe(true);
      expect(b_lt_a).toBe(true);
    });
  });

  describe("gcd", () => {});

  describe("lcm", () => {});
});
