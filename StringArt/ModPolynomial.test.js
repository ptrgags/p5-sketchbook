import { describe, it, expect } from "vitest";
import { ModPolynomial } from "./ModPolynomial";

describe("ModPolynomial", () => {
  describe("constructor", () => {
    it("throws for 0 modulus", () => {
      expect(() => {
        return new ModPolynomial(1, 2, 3, 4, 0);
      }).toThrowError("modulus must be a positive integer");
    });

    it("throws for negative modulus", () => {
      expect(() => {
        return new ModPolynomial(1, 2, 3, 4, -1);
      }).toThrowError("modulus must be a positive integer");
    });

    it("constructs from in-range coefficients", () => {
      const modulus = 7;

      const poly = new ModPolynomial(1, 2, 3, 4, modulus);

      expect(poly.coefficients).toEqual([1, 2, 3, 4]);
      expect(poly.modulus).toBe(modulus);
    });

    it("reduces out-of-range input coefficients", () => {
      const modulus = 10;

      const poly = new ModPolynomial(10, -1, -4, 13, modulus);

      expect(poly.coefficients).toEqual([0, 9, 6, 3]);
      expect(poly.modulus).toBe(modulus);
    });
  });

  describe("compute", () => {
    const MODULUS = 5;

    it("negative input is handled gracefully", () => {
      const poly = new ModPolynomial(0, 2, 3, 0, MODULUS);

      const result = poly.compute(-1);

      // 2(-1)^2 + 3(-1) = 2 - 3 = -1 = 4 (mod 5)
      expect(result).toBe(4);
    });

    it("out-of-range input is handled gracefully", () => {
      const poly = new ModPolynomial(0, 2, 0, 0, MODULUS);

      const result = poly.compute(6);

      // 2(6)^2 = 2(1)^2 = 2
      expect(result).toBe(2);
    });

    it("with 0 returns constant term", () => {
      const poly = new ModPolynomial(1, 2, 3, 4, MODULUS);

      const result = poly.compute(0);

      expect(result).toBe(4);
    });

    it("with 1 returns modular sum of coefficients", () => {
      const poly = new ModPolynomial(1, 2, 3, 3, MODULUS);

      const result = poly.compute(1);

      // 1 + 2 + 3 + 3 = 9 = 4 (mod 5)
      expect(result).toBe(4);
    });

    it("polynomial computes correct value", () => {
      const poly = new ModPolynomial(1, 2, 2, 1, MODULUS);

      const result = poly.compute(3);

      //   (3)^3 + 2(3)^2 + 2(3) + 1 (mod 5)
      // = 27 + 18 + 6 + 1 (mod 5)
      // = 2 + 3 + 1 + 1 (mod 5)
      // = 2 (mod 5)
      expect(result).toBe(2);
    });
  });

  describe("to_string", () => {
    const MODULUS = 5;

    it("with zero polynomial is 0", () => {
      const poly = new ModPolynomial(0, 0, 0, 0, MODULUS);

      const result = poly.to_string();

      expect(result).toBe("0 (mod 5)");
    });

    it("with constant polynomial returns constant", () => {
      const poly = new ModPolynomial(0, 0, 0, 4, MODULUS);

      const result = poly.to_string();

      expect(result).toBe("4 (mod 5)");
    });

    it("with linear term returns x term", () => {
      const poly = new ModPolynomial(0, 0, 2, 0, MODULUS);

      const result = poly.to_string();

      expect(result).toBe("2x (mod 5)");
    });

    it("with quadratic term returns x^2 term", () => {
      const poly = new ModPolynomial(0, 3, 0, 0, MODULUS);

      const result = poly.to_string();

      expect(result).toBe("3x^2 (mod 5)");
    });

    it("with cubic term returns x^3 term", () => {
      const poly = new ModPolynomial(2, 0, 0, 0, MODULUS);

      const result = poly.to_string();

      expect(result).toBe("2x^3 (mod 5)");
    });

    it("with multiple terms joins with plus", () => {
      const poly = new ModPolynomial(2, 0, 3, 0, MODULUS);

      const result = poly.to_string();

      expect(result).toBe("2x^3 + 3x (mod 5)");
    });

    it("coefficients of 1 are omitted", () => {
      const poly = new ModPolynomial(1, 1, 1, 0, MODULUS);

      const result = poly.to_string();

      expect(result).toBe("x^3 + x^2 + x (mod 5)");
    });

    it("constant 1 is kept", () => {
      const poly = new ModPolynomial(0, 0, 0, 1, MODULUS);

      const result = poly.to_string();

      expect(result).toBe("1 (mod 5)");
    });
  });
});
