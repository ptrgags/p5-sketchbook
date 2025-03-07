import { describe, it, expect } from "vitest";
import { Point } from "../pga2d/objects";
import { Joint } from "./AnimationChain";
import { PGA_MATCHERS } from "../pga2d/pga_matchers";

expect.extend(PGA_MATCHERS);

describe("Joint", () => {
  it("constraint_follow with large separation moves the point closer", () => {
    const point = Point.point(1, 0);
    const target = Point.point(0, -1);
    const follow_dist = 1.0;

    const result = Joint.constraint_follow(target, point, follow_dist);

    // The direction fro point to target is at a 45 degree angle, so we
    // want to move sqrt(2)/2 in the x and y direction starting from target.
    const expected = Point.point(Math.SQRT1_2, -(1.0 - Math.SQRT1_2));
    expect(result).toBePoint(expected);
  });

  it("constraint_follow with small separation moves the point further away", () => {
    const point = Point.point(0.25, -0.75);
    const target = Point.point(0, -1);
    const follow_dist = 1.0;

    const result = Joint.constraint_follow(target, point, follow_dist);

    // The direction fro point to target is at a 45 degree angle, so we
    // want to move sqrt(2)/2 in the x and y direction starting from target.
    const expected = Point.point(Math.SQRT1_2, -(1.0 - Math.SQRT1_2));
    expect(result).toBePoint(expected);
  });

  it("constraint_follow at the separation distance doesn't move the point", () => {
    const point = Point.point(1, 0);
    const target = Point.point(0, -1);
    const follow_dist = Math.SQRT2;

    const result = Joint.constraint_follow(target, point, follow_dist);

    expect(result).toBePoint(point);
  });

  describe("constraint_follow_bend", () => {
    it("Handles point in straight line gracefully", () => {
      const a = Point.point(0, 0);
      const b = Point.point(0, -1);
      const follow_dist = 1.0;
      const min_bend = (3 * Math.PI) / 4;
      const c = Point.point(0, -5);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend
      );

      const expected = Point.point(0, -2);
      expect(result).toBePoint(expected);
    });

    it("with shallow bend angle does simple following", () => {
      const a = Point.point(0, 0);
      const b = Point.point(0, -1);
      const follow_dist = 1.0;
      const min_bend = (3 * Math.PI) / 4;
      const c = Point.point(0.5, -3);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend
      );

      // Computed in this Desmos graph: https://www.desmos.com/calculator/afwiazpyir
      // this is B + normalize(C - B)
      const expected = Point.point(0.242535625036, -1.97014250015);
      expect(result).toBePoint(expected);
    });

    it("handles zero angle bend gracefully", () => {
      const a = Point.point(0, 0);
      const b = Point.point(0, -1);
      const follow_dist = 1;
      const min_bend = (3 * Math.PI) / 4;
      const c = a.scale(2);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend
      );

      const expected = Point.point(-Math.SQRT1_2, -Math.SQRT1_2 - 1);
      expect(result).toBePoint(expected);
    });

    it("with sharp bend on right snaps to right constraint angle", () => {
      const a = Point.point(0, 0);
      const b = Point.point(0, -1);
      const follow_dist = 1;
      const min_bend = (3 * Math.PI) / 4;
      const c = Point.point(1, 0);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend
      );

      const expected = Point.point(Math.SQRT1_2, -Math.SQRT1_2 - 1);
      expect(result).toBePoint(expected);
    });

    it("with sharp bend on left snaps to right constraint angle", () => {
      const a = Point.point(0, 0);
      const b = Point.point(0, -1);
      const follow_dist = 1;
      const min_bend = (3 * Math.PI) / 4;
      const c = Point.point(-1, 0);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend
      );

      const expected = Point.point(-Math.SQRT1_2, -Math.SQRT1_2 - 1);
      expect(result).toBePoint(expected);
    });

    it("with simple following uses the following distance from b to c, not a to b", () => {
      const a = Point.point(0, 0);
      const b = Point.point(0, -1);
      const follow_dist = 2.0;
      const min_bend = (3 * Math.PI) / 4;
      const c = Point.point(0, -5);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend
      );

      const expected = Point.point(0, -3);
      expect(result).toBePoint(expected);
    });

    it("with sharp bend on right uses the following distance from b to c, not a to b", () => {
      const a = Point.point(0, 0);
      const b = Point.point(0, -1);
      const follow_dist = 2;
      const min_bend = (3 * Math.PI) / 4;
      const c = Point.point(1, 0);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend
      );

      const expected = Point.point(2 * Math.SQRT1_2, -2 * Math.SQRT1_2 - 1);
      expect(result).toBePoint(expected);
    });

    it("with sharp bend on left uses the following distance from b to c, not a to b", () => {
      const a = Point.point(0, 0);
      const b = Point.point(0, -1);
      const follow_dist = 2;
      const min_bend = (3 * Math.PI) / 4;
      const c = Point.point(-1, 0);

      const result = Joint.constraint_follow_bend(
        a,
        b,
        c,
        follow_dist,
        min_bend
      );

      const expected = Point.point(-2 * Math.SQRT1_2, -2 * Math.SQRT1_2 - 1);
      expect(result).toBePoint(expected);
    });
  });
});
