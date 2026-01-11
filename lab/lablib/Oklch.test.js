import { describe, it, expect } from "vitest";
import { Oklch } from "./Oklch.js";
import { Color } from "../../sketchlib/Color.js";

describe("Oklch", () => {
  it("constructor without alpha sets alpha to 1", () => {
    const color = new Oklch(0.7, 0.1, 300);

    const expected = new Oklch(0.7, 0.1, 300, 1);
    expect(color).toEqual(expected);
  });

  describe("adjust_lightness", () => {
    it("with positive delta increases brightness", () => {
      const color = new Oklch(0.5, 0.1, 300);

      const result = color.adjust_lightness(0.1);

      const expected = new Oklch(0.6, 0.1, 300);
      expect(result).toEqual(expected);
    });

    it("with negative delta decreases brightness", () => {
      const color = new Oklch(0.5, 0.1, 300);

      const result = color.adjust_lightness(-0.1);

      const expected = new Oklch(0.4, 0.1, 300);
      expect(result).toEqual(expected);
    });

    it("clamps negative value", () => {
      const color = new Oklch(0.5, 0.1, 300);

      const result = color.adjust_lightness(-0.8);

      const expected = new Oklch(0, 0.1, 300);
      expect(result).toEqual(expected);
    });

    it("clamps out of range value", () => {
      const color = new Oklch(0.5, 0.1, 300);

      const result = color.adjust_lightness(0.8);

      const expected = new Oklch(1, 0.1, 300);
      expect(result).toEqual(expected);
    });
  });

  // NOTE: oklch.com uses the npm module culori which has slightly different
  // conversion coefficients than in the blog post... so I don't really
  // have a good source of truth. So these tests are to catch regressions.
  describe("to_srgb", () => {
    it("oklch(0, 0, 0) = black", () => {
      const black = new Oklch(0, 0, 0);

      const result = black.to_srgb();

      const expected = new Color(0, 0, 0);
      expect(result).toEqual(expected);
    });

    it("oklch(1, 0, 0) = white", () => {
      const white = new Oklch(1, 0, 0);

      const result = white.to_srgb();

      const expected = new Color(247, 247, 247);
      expect(result).toEqual(expected);
    });

    it("oklch(0.6, 0, 0) = half grey", () => {
      // Note that srgb is nonlinear given human perception of light,
      // so the lightness here is > 0.5
      const medium_grey = new Oklch(0.6, 0, 0);

      const result = medium_grey.to_srgb();

      const expected = new Color(124, 124, 124);
      expect(result).toEqual(expected);
    });

    it("converts color (1)", () => {
      // Blue color picked via https://oklch.com/#0.75,0.1,220,100
      const color = new Oklch(0.75, 0.1, 220);

      const result = color.to_srgb();

      const expected = new Color(88, 183, 211);
      expect(result).toEqual(expected);
    });

    it("converts color (2)", () => {
      // desaturated maroon via https://oklch.com/#0.5,0.05,30,100
      const color = new Oklch(0.5, 0.05, 30);

      const result = color.to_srgb();

      // Note: Oklch.com gives
      // #7d5952 is (125, 89, 82) which is slightly off
      const expected = new Color(121, 86, 79);
      expect(result).toEqual(expected);
    });
  });

  describe("lerp", () => {
    it("with t < 0 throws", () => {
      const a = new Oklch(0.4, 0.05, 300, 0);
      const b = new Oklch(0.8, 0.1, 100, 1);
      expect(() => {
        return Oklch.lerp(a, b, -1);
      }).toThrowError("must be in [0, 1]");
    });

    it("with t=0 returns a", () => {
      const a = new Oklch(0.7, 0.1, 300);
      const b = new Oklch(0.7, 0.1, 25);

      const result = Oklch.lerp(a, b, 0);

      expect(result).toEqual(a);
    });

    it("with t between 0 and 1 returns  mix of a and b", () => {
      const a = new Oklch(0.4, 0.05, 300, 0);
      const b = new Oklch(0.8, 0.1, 100, 1);

      const result = Oklch.lerp(a, b, 0.25);

      // lightness = 3/4 * 0.4 + 1/4 * 0.8 = 0.5
      // chroma = 3/4 * 0.05 + 1/4 * 0.1 = 0.0625
      // hue = 3/4 * 300 + 1/4 * 100 = 250
      // alpha = 3/4 * 0 + 1/4 * 1 = 0.25
      const expected = new Oklch(0.5, 0.0625, 250, 0.25);
      expect(result).toEqual(expected);
    });

    it("with t=1 returns b", () => {
      const a = new Oklch(0.7, 0.1, 300);
      const b = new Oklch(0.7, 0.1, 25);

      const result = Oklch.lerp(a, b, 1);

      expect(result).toEqual(b);
    });

    it("with a=b returns a", () => {
      const a = new Oklch(0.7, 0.1, 300);

      const result = Oklch.lerp(a, a, 0.25);

      expect(result).toEqual(a);
    });

    it("with t > 1 throws", () => {
      const a = new Oklch(0.4, 0.05, 300, 0);
      const b = new Oklch(0.8, 0.1, 100, 1);

      expect(() => {
        return Oklch.lerp(a, b, 2);
      }).toThrowError("must be in [0, 1]");
    });
  });

  describe("gradient", () => {
    it("with 0 steps returns empty array", () => {
      const a = new Oklch(0.4, 0.1, 300);
      const b = new Oklch(0.8, 0.1, 300);

      const result = Oklch.gradient(a, b, 0);

      expect(result).toEqual([]);
    });

    it("with 1 step returns start color", () => {
      const a = new Oklch(0.4, 0.1, 300);
      const b = new Oklch(0.8, 0.1, 300);

      const result = Oklch.gradient(a, b, 1);

      expect(result).toEqual([a]);
    });

    it("with 2 steps returns start and end color", () => {
      const a = new Oklch(0.4, 0.1, 300);
      const b = new Oklch(0.8, 0.1, 300);

      const result = Oklch.gradient(a, b, 2);

      expect(result).toEqual([a, b]);
    });

    it("with 3 steps returns start, end and 50 percent mix", () => {
      const a = new Oklch(0.3, 0.1, 100);
      const b = new Oklch(0.4, 0.1, 300);

      const result = Oklch.gradient(a, b, 3);

      const expected_mid = new Oklch(0.35, 0.1, 200);
      expect(result).toEqual([a, expected_mid, b]);
    });

    it("with several steps produces gradient", () => {
      const a = new Oklch(0, 0, 0);
      const b = new Oklch(1, 0.25, 100);

      const result = Oklch.gradient(a, b, 5);

      const expected = [
        new Oklch(0, 0, 0),
        new Oklch(0.25, 0.0625, 25),
        new Oklch(0.5, 0.125, 50),
        new Oklch(0.75, 0.1875, 75),
        new Oklch(1, 0.25, 100),
      ];
      expect(result).toEqual(expected);
    });
  });
});
