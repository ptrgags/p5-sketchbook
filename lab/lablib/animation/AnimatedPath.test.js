import { describe, it, expect } from "vitest";
import { AnimatedPath } from "./AnimatedPath.js";
import { LinePrimitive } from "../../../sketchlib/primitives/LinePrimitive.js";
import { Point } from "../../../pga2d/Point.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { group } from "../../../sketchlib/primitives/shorthand.js";

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
  describe("is_done", () => {});

  describe("get_position", () => {
    it("with empty path returns undefined", () => {
      const path = new AnimatedPath([], 0, 1);

      const result = path.get_position(0.5);

      expect(result).toBeUndefined();
    });
  });

  describe("get_tangent", () => {});

  describe("render", () => {});

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
      expect(result).toBe(GroupPrimitive.EMPTY);
    });

    it("with both times after end returns empty path", () => {
      const path = make_path();

      const result = path.render_between(8, 10);

      expect(result).toBe(GroupPrimitive.EMPTY);
    });
  });
});
