import { describe, it, expect } from "vitest";
import { ArcAngles } from "./ArcAngles";

describe("ArcAngles", () => {
  describe("constructor", () => {
    it("with greater than full circle throws error", () => {
      expect(() => {
        return new ArcAngles(-Math.PI / 4, Math.PI * 8);
      }).toThrowError("angle must be no bigger than 2pi");
    });

    it("with 0s constructs", () => {
      const angles = new ArcAngles(0, 0);

      expect(angles.start_angle).toBe(0);
      expect(angles.end_angle).toBe(0);
    });

    it("with equal angles constructs", () => {
      const angles = new ArcAngles(Math.PI / 3, Math.PI / 3);

      expect(angles.start_angle).toBeCloseTo(Math.PI / 3);
      expect(angles.end_angle).toBeCloseTo(Math.PI / 3);
    });

    it("with full circle constructs", () => {
      const angles = new ArcAngles(Math.PI / 4, (9 * Math.PI) / 4);

      expect(angles.start_angle).toBeCloseTo(Math.PI / 4);
      expect(angles.end_angle).toBeCloseTo((9 * Math.PI) / 4);
    });

    it("with out-of-range values (1) reduces", () => {
      const angles = new ArcAngles(2 * Math.PI, 3 * Math.PI);

      const expected = new ArcAngles(0, Math.PI);

      expect(angles.equals(expected)).toBe(true);
    });

    it("with out-of-range values (2) reduces", () => {
      const angles = new ArcAngles((9 * Math.PI) / 4, (11 * Math.PI) / 4);

      const expected = new ArcAngles(Math.PI / 4, (3 * Math.PI) / 4);

      expect(angles.equals(expected)).toBe(true);
    });

    it("with out-of-range values (3) reduces", () => {
      const angles = new ArcAngles(-Math.PI / 4, (-3 * Math.PI) / 4);

      const expected = new ArcAngles((7 * Math.PI) / 4, (5 * Math.PI) / 4);

      expect(angles.equals(expected)).toBe(true);
    });
  });

  describe("direction", () => {
    it("half circle is positive", () => {
      const angles = new ArcAngles(0, Math.PI);
      expect(angles.direction).toBe(1);
    });

    it("with same angles is zero", () => {
      const angles = new ArcAngles(Math.PI / 2, Math.PI / 2);
      expect(angles.direction).toBe(0);
    });

    it("with negative end is negative", () => {
      const angles = new ArcAngles(0, -Math.PI / 2);
      expect(angles.direction).toBe(-1);
    });

    it("with out of range angles is negative", () => {
      const angles = new ArcAngles(3 * Math.PI, 2 * Math.PI);
      expect(angles.direction).toBe(-1);
    });

    it("with out of range angles is positive", () => {
      const angles = new ArcAngles(-Math.PI / 4, Math.PI / 2);
      expect(angles.direction).toBe(1);
    });
  });

  describe("angle", () => {
    it("with arc computes central angle", () => {
      const angles = new ArcAngles(-Math.PI / 4, Math.PI / 2);

      const result = angles.angle;

      const expected = (3 * Math.PI) / 4;
      expect(result).toEqual(expected);
    });
  });

  it("flip_y negates angles", () => {
    const angles = new ArcAngles(-Math.PI / 3, Math.PI / 4);

    const result = angles.flip_y();

    const expected = new ArcAngles(Math.PI / 3, -Math.PI / 4);
    expect(result.equals(expected)).toBe(true);
  });

  it("reverse swaps angles", () => {
    const angles = new ArcAngles(-Math.PI / 3, Math.PI / 4);

    const result = angles.reverse();

    const expected = new ArcAngles(Math.PI / 4, -Math.PI / 3);
    expect(result.equals(expected)).toBe(true);
  });

  describe("from_raw_angles", () => {
    it("with positive angles computes correct arc", () => {
      const start_angle = Math.PI / 4;
      const end_angle = (2.0 * Math.PI) / 3;
      const direction = 1;

      const result = ArcAngles.from_raw_angles(
        start_angle,
        end_angle,
        direction,
      );

      const expected = new ArcAngles(Math.PI / 4, (2 * Math.PI) / 3);
      expect(result.equals(expected)).toEqual(true);
    });

    it("with positive arc through atan2 branch point computes correct arc", () => {
      const start_angle = (3 * Math.PI) / 4;
      const end_angle = (-3 * Math.PI) / 4;
      const direction = 1;

      const result = ArcAngles.from_raw_angles(
        start_angle,
        end_angle,
        direction,
      );

      const expected = new ArcAngles((3 * Math.PI) / 4, (5 * Math.PI) / 4);
      expect(result.equals(expected)).toEqual(true);
    });

    it("with negative arc computes correct arc", () => {
      const start_angle = Math.PI / 4;
      const end_angle = -Math.PI / 4;
      const direction = -1;

      const result = ArcAngles.from_raw_angles(
        start_angle,
        end_angle,
        direction,
      );

      const expected = new ArcAngles(Math.PI / 4, -Math.PI / 4);
      expect(result.equals(expected)).toEqual(true);
    });

    it("with negative arc through atan2 branch point", () => {
      const start_angle = (3 * Math.PI) / 4;
      const end_angle = (-3 * Math.PI) / 4;
      const direction = -1;

      const result = ArcAngles.from_raw_angles(
        start_angle,
        end_angle,
        direction,
      );

      const expected = new ArcAngles((3 * Math.PI) / 4, (-3 * Math.PI) / 4);
      expect(result.equals(expected)).toEqual(true);
    });
  });
});
