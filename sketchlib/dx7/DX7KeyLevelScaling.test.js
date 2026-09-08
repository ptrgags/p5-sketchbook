import { describe, it, expect } from "vitest";
import { DX7KeyLevelScaling, DX7ScalingCurve } from "./DX7KeyLevelScaling.js";

describe("DX7KeyLevelScaling", () => {
  describe("breakpoint_name", () => {
    it("with 0 returns A-1", () => {
      const scaling = new DX7KeyLevelScaling(
        0,
        DX7ScalingCurve.INIT,
        DX7ScalingCurve.INIT,
      );

      const result = scaling.breakpoint_name;

      const expected = "A-1";
      expect(result).toEqual(expected);
    });

    it("with 99 returns C8", () => {
      const scaling = new DX7KeyLevelScaling(
        99,
        DX7ScalingCurve.INIT,
        DX7ScalingCurve.INIT,
      );

      const result = scaling.breakpoint_name;

      const expected = "C8";
      expect(result).toEqual(expected);
    });
  });
});
