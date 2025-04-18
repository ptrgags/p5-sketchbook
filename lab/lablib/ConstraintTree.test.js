import { describe, it, expect } from "vitest";
import { AngleConstraint } from "./ConstraintTree.js";
import { PI } from "../../sketchlib/math_consts.js";
import { Point } from "../../pga2d/objects.js";
import { PGA_MATCHERS } from "../../pga2d/pga_matchers";

expect.extend(PGA_MATCHERS);

function make_constraint() {
  return new AngleConstraint(-PI / 3, PI / 4);
}

describe("Angle Constraint", () => {
  describe("constrain", () => {
    it("with current_dir in range returns current_dir", () => {
      const constraint = make_constraint();
      const dir_backward = Point.DIR_Y.neg();
      const in_range = Point.dir_from_angle((-5 * PI) / 12);

      const result = constraint.constrain(dir_backward, in_range);

      expect(result).toBe(in_range);
    });

    it("with current_dir outside min bound returns min direction", () => {
      const constraint = make_constraint();
      const dir_backward = Point.DIR_Y.neg();
      const out_of_range = Point.dir_from_angle((3 * PI) / 4);

      const result = constraint.constrain(dir_backward, out_of_range);

      // backward is -PI / 2, and we subtract another PI / 3
      const expected_dir = Point.dir_from_angle((-5 * PI) / 6);
      expect(result).toBePoint(expected_dir);
    });

    it("with current_dir outside max bound returns min direction", () => {
      const constraint = make_constraint();
      const dir_backward = Point.DIR_Y.neg();
      const in_range = Point.dir_from_angle(PI / 6);

      const result = constraint.constrain(dir_backward, in_range);

      // backward is -PI / 2, and we add PI / 4
      const expected_dir = Point.dir_from_angle(-PI / 4);
      expect(result).toBePoint(result, expected_dir);
    });
  });
});
