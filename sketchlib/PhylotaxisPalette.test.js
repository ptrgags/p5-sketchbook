import { describe, it, expect } from "vitest";
import { PhyllotaxisPalette } from "./PhyllotaxisPalette.js";

describe("PhyllotaxisPalette", () => {
  describe("constructor", () => {
    it("throws if primordia count is less than 2", () => {
      expect(() => {
        return new PhyllotaxisPalette(1);
      }).toThrowError(/must be at least 2/);
    });
  });

  describe("get_point", () => {
    it("throws for index less than 0", () => {
      const palette = new PhyllotaxisPalette(10);

      expect(() => {
        return palette.get_point(-1);
      }).toThrowError(/must be nonnegative/);
    });

    it("throws for index at length of palette", () => {
      const palette = new PhyllotaxisPalette(10);

      expect(() => {
        return palette.get_point(10);
      }).toThrowError(/must be less than the palette length of 10/);
    });

    it("index 0 results in (1, 0)", () => {
      const palette = new PhyllotaxisPalette(15);

      const result = palette.get_point(0);

      expect(result).toEqual({
        r: 1,
        theta: 0,
      });
    });

    it("in-between index computes the correct point", () => {
      const palette = new PhyllotaxisPalette(7);

      const { r, theta } = palette.get_point(3);

      // 1 - 3/6
      expect(r).toBe(0.5);

      // 3 times the golden angle normalized to [0, 1)
      expect(theta).toBeCloseTo(0.9167043820063725);
    });

    it("index N - 1 results in the origin", () => {
      const palette = new PhyllotaxisPalette(13);

      const { r } = palette.get_point(12);

      // The angle doesn't matter
      expect(r).toBe(0);
    });
  });

  describe("get_color", () => {
    it("throws for index less than 0", () => {
      const palette = new PhyllotaxisPalette(10);

      expect(() => {
        return palette.get_color(-1);
      }).toThrowError(/must be nonnegative/);
    });

    it("throws for index at length of palette", () => {
      const palette = new PhyllotaxisPalette(10);

      expect(() => {
        return palette.get_color(10);
      }).toThrowError(/must be less than the palette length of 10/);
    });

    it("index 0 returns red", () => {
      const palette = new PhyllotaxisPalette(8);

      const result = palette.get_color(0);

      expect(result).toEqual({
        hue: 0,
        saturation: 1,
        value: 1,
      });
    });

    it("in-between index computes the correct color", () => {
      const palette = new PhyllotaxisPalette(7);

      const { hue, saturation, value } = palette.get_color(5);

      // 5 times the golden angle normalized to [0, 1)
      expect(hue).toBeCloseTo(0.9098300562505257);
      expect(saturation).toBeCloseTo(1 / 6);
      expect(value).toBe(1);
    });

    it("when index is N - 1, returns white", () => {
      const palette = new PhyllotaxisPalette(8);

      const { saturation, value } = palette.get_color(7);

      // Hue doesn't matter for grey values
      expect(saturation).toBe(0);
      expect(value).toBe(1);
    });
  });
});
