import { describe, it, expect } from "vitest";
import { ArcPrimitive } from "./ArcPrimitive.js";
import { ArcAngles } from "../ArcAngles.js";
import { Point } from "../pga2d/Point.js";

describe("ArcPrimitive", () => {
  it("arc_length returns the correct arc length", () => {
    const arc = new ArcPrimitive(
      Point.ORIGIN,
      2,
      new ArcAngles(-Math.PI / 4, Math.PI / 4),
    );

    const result = arc.arc_length;

    // angle * radius = (pi/2) * 2 = pi
    const expected = Math.PI;
    expect(result).toBeCloseTo(expected);
  });

  describe("get_arc_length", () => {
    const arc = new ArcPrimitive(
      Point.ORIGIN,
      2,
      new ArcAngles(-Math.PI / 4, Math.PI / 4),
    );

    it("with 0 returns 0", () => {
      const result = arc.get_arc_length(0);

      const expected = 0;
      expect(result).toBeCloseTo(expected);
    });

    it("with 1 returns length", () => {
      const result = arc.get_arc_length(1);

      const expected = Math.PI;
      expect(result).toBeCloseTo(expected);
    });

    it("with 0.5 returns half of the length", () => {
      const result = arc.get_arc_length(0.5);

      const expected = Math.PI / 2;
      expect(result).toBeCloseTo(expected);
    });
  });

  describe("get_t", () => {
    const arc = new ArcPrimitive(
      Point.ORIGIN,
      2,
      new ArcAngles(-Math.PI / 4, Math.PI / 4),
    );

    it("with 0 returns 0", () => {
      const result = arc.get_t(0);

      const expected = 0;
      expect(result).toBeCloseTo(expected);
    });

    it("with arc length returns 1", () => {
      const result = arc.get_t(Math.PI);

      const expected = 1;
      expect(result).toBeCloseTo(expected);
    });

    it("with half arc length returns 0.5", () => {
      const result = arc.get_t(Math.PI / 2);

      const expected = 0.5;
      expect(result).toBeCloseTo(expected);
    });
  });
});
