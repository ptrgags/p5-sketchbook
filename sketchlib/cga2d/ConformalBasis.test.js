import { describe, it, expect } from "vitest";
import { ConformalBasis } from "./ConformalBasis.js";

describe("ConformalBasis", () => {
  describe("get_inf, get_o", () => {
    it("p + m maps to inf", () => {
      const p = 1;
      const m = 1;

      const result_inf = ConformalBasis.get_inf(p, m);
      const result_o = ConformalBasis.get_o(p, m);

      const expected_inf = 1;
      const expected_o = 0;
      expect(result_inf).toBe(expected_inf);
      expect(result_o).toBe(expected_o);
    });

    it("0.5 * (m - p) maps to o", () => {
      const p = -0.5;
      const m = 0.5;

      const result_inf = ConformalBasis.get_inf(p, m);
      const result_o = ConformalBasis.get_o(p, m);

      const expected_inf = 0;
      const expected_o = 1;
      expect(result_inf).toBe(expected_inf);
      expect(result_o).toBe(expected_o);
    });
  });

  describe("get_p, get_m", () => {
    it("with inf gives 1, 1", () => {
      const inf = 1;
      const o = 0;

      const result_p = ConformalBasis.get_p(inf, o);
      const result_m = ConformalBasis.get_m(inf, o);

      const expected_p = 1;
      const expected_m = 1;
      expect(result_p).toBe(expected_p);
      expect(result_m).toBe(expected_m);
    });

    it("with o gives -0.5, 0.5", () => {
      const inf = 0;
      const o = 1;

      const result_p = ConformalBasis.get_p(inf, o);
      const result_m = ConformalBasis.get_m(inf, o);

      const expected_p = -0.5;
      const expected_m = 0.5;
      expect(result_p).toBe(expected_p);
      expect(result_m).toBe(expected_m);
    });
  });
});
