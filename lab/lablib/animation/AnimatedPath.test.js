import { describe, it, expect } from "vitest";
import { AnimatedPath } from "./AnimatedPath.js";
import { LinePrimitive } from "../../../sketchlib/primitives/LinePrimitive.js";
import { Point } from "../../../pga2d/Point.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { group } from "../../../sketchlib/primitives/shorthand.js";
import { PGA_MATCHERS } from "../../../pga2d/pga_matchers.js";
import { Direction } from "../../../pga2d/Direction.js";

expect.extend(PGA_MATCHERS);

const A = new Point(0, 0);
const B = new Point(1, 0);
const C = new Point(1, 1);
const D = new Point(0, 1);

const AB = new LinePrimitive(A, B);
const BC = new LinePrimitive(B, C);
const CD = new LinePrimitive(C, D);
const DA = new LinePrimitive(D, A);

function make_path() {
  // walk around a square when t is in [1, 5]
  return new AnimatedPath([AB, BC, CD, DA], 1, 4);
}

describe("AnimatedPath", () => {
  describe("is_done", () => {
    it("with time before start returns false", () => {
      const path = make_path();

      const result = path.is_done(0);

      expect(result).toBe(false);
    });

    it("with time within range returns false", () => {
      const path = make_path();

      const result = path.is_done(2);

      expect(result).toBe(false);
    });

    it("with time exactly at end returns false", () => {
      const path = make_path();

      const result = path.is_done(5);

      expect(result).toBe(false);
    });

    it("with time after end returns true", () => {
      const path = make_path();

      const result = path.is_done(7);

      expect(result).toBe(true);
    });
  });

  describe("get_position", () => {
    it("with empty path returns undefined", () => {
      const path = new AnimatedPath([], 0, 1);

      const result = path.get_position(0.5);

      expect(result).toBeUndefined();
    });

    it("with time before start returns start point", () => {
      const path = make_path();

      const result = path.get_position(1);

      expect(result).toBePoint(A);
    });

    it("with time in middle of range returns correct position", () => {
      const path = make_path();

      const result = path.get_position(3.25);

      const expected = new Point(0.75, 1);
      expect(result).toBePoint(expected);
    });

    it("with time after end returns end point", () => {
      const path = make_path();

      const result = path.get_position(5);

      expect(result).toBePoint(A);
    });
  });

  describe("get_tangent", () => {
    it("with empty path returns undefined", () => {
      const path = new AnimatedPath([], 0, 1);

      const result = path.get_tangent(0.5);

      expect(result).toBeUndefined();
    });

    it("with time before start returns tangent at start", () => {
      const path = make_path();

      const result = path.get_tangent(1);

      expect(result).toBeDirection(Direction.DIR_X);
    });

    it("with time in middle of range returns correct position", () => {
      const path = make_path();

      const result = path.get_tangent(3.25);

      const expected = Direction.DIR_X.neg();
      expect(result).toBeDirection(expected);
    });

    it("with time after end returns tangent at end of path", () => {
      const path = make_path();

      const result = path.get_tangent(5);

      const expected = Direction.DIR_Y.neg();
      expect(result).toBeDirection(expected);
    });
  });

  describe("render", () => {
    it("with time less than start returns empty group", () => {
      const path = make_path();

      const result = path.render(-1);

      expect(result).toEqual(GroupPrimitive.EMPTY);
    });

    it("with time in between start and end returns partial path", () => {
      const path = make_path();

      const result = path.render(2.5);

      const half_bc = new LinePrimitive(B, new Point(1, 0.5));
      const expected = group(AB, half_bc);
      expect(result).toBe(expected);
    });

    it("with time greater than end returns whole path", () => {
      const path = make_path();

      const result = path.render(8);

      const expected = group(AB, BC, CD, DA);
      expect(result).toEqual(expected);
    });
  });

  describe("render_between", () => {
    it("with time_a > time_b returns empty group", () => {
      const path = make_path();

      const result = path.render_between(10, 5);

      expect(result).toBe(GroupPrimitive.EMPTY);
    });

    it("with time_a === time_b returns empty group", () => {
      const path = make_path();

      const result = path.render_between(3, 3);

      expect(result).toBe(GroupPrimitive.EMPTY);
    });

    it("with both times before start returns empty group", () => {
      const path = make_path();

      const result = path.render_between(0, 0.5);

      expect(result).toBe(GroupPrimitive.EMPTY);
    });

    it("with time_a before start returns path up to time_b", () => {
      const path = make_path();

      const result = path.render_between(0, 2);

      const expected = AB;
      expect(result).toEqual(expected);
    });

    it("with time_b after end returns path from a to the end", () => {
      const path = make_path();

      const result = path.render_between(2, 10);

      const expected = group(BC, CD, DA);
      expect(result).toBe(expected);
    });

    it("with both times after end returns empty path", () => {
      const path = make_path();

      const result = path.render_between(8, 10);

      expect(result).toBe(GroupPrimitive.EMPTY);
    });
  });
});
