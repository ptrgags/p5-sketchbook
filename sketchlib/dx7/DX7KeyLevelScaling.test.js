import { describe, it, expect } from "vitest";
import { DX7KeyLevelScaling, DX7ScalingCurve } from "./DX7KeyLevelScaling.js";

describe("DX7KeyLevelScaling", () => {
  describe("breakpoint_name", () => {
    it("with negative breakpoint throws error", () => {
      expect(() => {
        return new DX7KeyLevelScaling(
          -1,
          DX7ScalingCurve.INIT,
          DX7ScalingCurve.INIT,
        );
      }).toThrowError("breakpoint must be in [0, 99]");
    });

    it("with breakpoint too large throws error", () => {
      expect(() => {
        return new DX7KeyLevelScaling(
          100,
          DX7ScalingCurve.INIT,
          DX7ScalingCurve.INIT,
        );
      }).toThrowError("breakpoint must be in [0, 99]");
    });

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

    it("with 51 returns C4", () => {
      const scaling = new DX7KeyLevelScaling(
        51,
        DX7ScalingCurve.INIT,
        DX7ScalingCurve.INIT,
      );

      const result = scaling.breakpoint_name;

      const expected = "C4";
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

  describe("breakpoint_from_note_name", () => {
    it("with pitch below valid range throws error", () => {
      expect(() => {
        return DX7KeyLevelScaling.breakpoint_from_note_name("C-1");
      }).toThrowError("breakpoint must be in [A-1, C8]");
    });

    it("with pitch above valid range throws error", () => {
      expect(() => {
        return DX7KeyLevelScaling.breakpoint_from_note_name("C9");
      }).toThrowError("breakpoint must be in [A-1, C8]");
    });

    it("with A-1 returns 0", () => {
      const result = DX7KeyLevelScaling.breakpoint_from_note_name("A-1");

      const expected = 0;
      expect(result).toEqual(expected);
    });

    it("with C4 returns 51", () => {
      const result = DX7KeyLevelScaling.breakpoint_from_note_name("C4");

      const expected = 51;
      expect(result).toEqual(expected);
    });

    it("with C8 returns 99", () => {
      const result = DX7KeyLevelScaling.breakpoint_from_note_name("C8");

      const expected = 99;
      expect(result).toEqual(expected);
    });
  });
});
