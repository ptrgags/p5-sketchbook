import { describe, it, expect } from "vitest";
import { Polar } from "./Polar.js";

describe("Polar", () => {
  describe("x and y getters", () => {
    it("theta = 0 results in x = r and y = 0", () => {
      const r = 10;
      const polar = new Polar(r, 0);

      const { x, y } = polar;

      expect(x).toBeCloseTo(r);
      expect(y).toBeCloseTo(0);
    });

    it("theta = pi/6 results in the correct x and y", () => {
      const r = 2;
      const theta = Math.PI / 6;
      const polar = new Polar(r, theta);

      const { x, y } = polar;

      // Note the radius of 2
      const expected_x = Math.sqrt(3);
      const expected_y = 1;
      expect(x).toBeCloseTo(expected_x);
      expect(y).toBeCloseTo(expected_y);
    });

    it("results are computed with a y-up convention", () => {
      const r = 2;
      const theta = Math.PI / 5;
      const polar = new Polar(r, theta);

      const { y } = polar;

      expect(y).toBeGreaterThan(0);
    });

    it("negative radius results in negative x and y", () => {
      const r = -1;
      const theta = Math.PI / 3;
      const polar = new Polar(r, theta);

      const { x, y } = polar;

      const expected_x = -1 / 2;
      const expected_y = -Math.sqrt(3) / 2;
      expect(x).toBeCloseTo(expected_x);
      expect(y).toBeCloseTo(expected_y);
    });
  });
});
