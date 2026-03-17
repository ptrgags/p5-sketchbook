import { describe, it, expect } from "vitest";
import { DashedTree } from "./DashedTree.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Point } from "../sketchlib/pga2d/Point.js";

// Tree looks like this:
//
// x
// 0   1   2   3   4   5   6
//
//         E ----- F - G      2
//         |
//         |                  1
//         |
// A ----- B - C --------- D  0  y
//
// cumulative arc length from A at:
// A: 0
// B: 2
// C: 3
// D: 6
// E: 4
// F: 6
// G: 7
const POINT_A = Point.ORIGIN;
const POINT_B = new Point(2, 0);
const POINT_C = new Point(3, 0);
const POINT_D = new Point(6, 0);
const POINT_E = new Point(2, 2);
const POINT_F = new Point(4, 2);
const POINT_G = new Point(5, 2);

/**
 * @returns {DashedTree}
 */
function make_tree() {
  return new DashedTree(
    new LineSegment(POINT_A, POINT_B),
    new DashedTree(
      new LineSegment(POINT_B, POINT_C),
      new DashedTree(new LineSegment(POINT_C, POINT_D)),
    ),
    new DashedTree(
      new LineSegment(POINT_B, POINT_E),
      new DashedTree(
        new LineSegment(POINT_E, POINT_F),
        new DashedTree(new LineSegment(POINT_F, POINT_G)),
      ),
    ),
  );
}

describe("DashedTree", () => {
  it("iter_segments returns all paths in preorder", () => {
    const tree = make_tree();

    const result = tree.iter_segments().toArray();

    const expected = [
      new LineSegment(POINT_A, POINT_B),
      new LineSegment(POINT_B, POINT_C),
      new LineSegment(POINT_C, POINT_D),
      new LineSegment(POINT_B, POINT_E),
      new LineSegment(POINT_E, POINT_F),
      new LineSegment(POINT_F, POINT_G),
    ];
    expect(result).toEqual(expected);
  });

  describe("compute_dashes", () => {
    it("without calling measure_lengths first throws error", () => {
      const tree = make_tree();

      expect(() => {
        return tree.compute_dashes([[0, 3]]);
      }).toThrowError(
        "measure_lengths() must be called before compute_dashes()",
      );
    });

    it("with no dash queries returns empty list", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([]);

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with interval before start returns nothing", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[-10, -1]]);

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with interval after end of all paths returns nothing", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[10, 20]]);

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with very long dash returns whole tree in preorder", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[-1, 10]]);

      const expected = [
        new LineSegment(POINT_A, POINT_B),
        new LineSegment(POINT_B, POINT_C),
        new LineSegment(POINT_C, POINT_D),
        new LineSegment(POINT_B, POINT_E),
        new LineSegment(POINT_E, POINT_F),
        new LineSegment(POINT_F, POINT_G),
      ];
      expect(result).toEqual(expected);
    });

    it("ignores empty intervals", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[1, 1]]);

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("ignores backwards intervals", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[2, 1]]);

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with interval inside first segment returns the overlap", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[0.5, 1.5]]);

      const expected = [new LineSegment(new Point(0.5, 0), new Point(1.5, 0))];
      expect(result).toEqual(expected);
    });

    it("with interval inside segements from different branches returns both dashes", () => {
      const tree = make_tree();
      tree.measure_lengths();

      // this interval is between C and D on one branch
      // and between E and F on another
      const result = tree.compute_dashes([[4.5, 5.5]]);

      const expected = [
        new LineSegment(new Point(4.5, 0), new Point(5.5, 0)),
        new LineSegment(new Point(2.5, 2), new Point(3.5, 2)),
      ];
      expect(result).toEqual(expected);
    });

    it("with dash overlapping start returns partial interval", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[-1, 1]]);

      const expected = [new LineSegment(new Point(0, 0), new Point(1, 0))];
      expect(result).toEqual(expected);
    });

    it("with dash overlapping end of one branch returns only that interval", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[6.5, 10]]);

      const expected = [new LineSegment(new Point(4.5, 2), POINT_G)];
      expect(result).toEqual(expected);
    });

    it("with dash overlapping end of both branches returns both overlaps", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[5, 10]]);

      const expected = [
        new LineSegment(new Point(5, 0), POINT_D),
        new LineSegment(new Point(3, 2), POINT_F),
        new LineSegment(POINT_F, POINT_G),
      ];
      expect(result).toEqual(expected);
    });

    it("with dash exactly matching first interval returns that interval", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[0, 2]]);

      const expected = [new LineSegment(POINT_A, POINT_B)];
      expect(result).toEqual(expected);
    });

    it("with dash exactly matching interval in a branch returns that interval and corresponding overlaps", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[2, 3]]);

      const expected = [
        new LineSegment(POINT_B, POINT_C),
        new LineSegment(POINT_B, new Point(2, 1)),
      ];
      expect(result).toEqual(expected);
    });

    it("with dash straddling segments returns correct overlaps", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([[1, 2.5]]);

      const expected = [
        new LineSegment(new Point(1, 0), POINT_B),
        new LineSegment(POINT_B, new Point(2.5, 0)),
        new LineSegment(POINT_B, new Point(2, 0.5)),
      ];
      expect(result).toEqual(expected);
    });

    it("with dashes with gap returns correct overlaps", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([
        [-1, 1],
        [4, 5],
      ]);

      const expected = [
        new LineSegment(POINT_A, new Point(1, 0)),
        new LineSegment(new Point(4, 0), new Point(5, 0)),
        new LineSegment(POINT_E, new Point(3, 2)),
      ];
      expect(result).toEqual(expected);
    });

    it("with multiple intervals overlapping the same segment returns correct overlaps", () => {
      const tree = make_tree();
      tree.measure_lengths();

      const result = tree.compute_dashes([
        [3, 4],
        [5, 6],
      ]);

      const expected = [
        // bottom branch
        new LineSegment(POINT_C, new Point(4, 0)),
        new LineSegment(new Point(5, 0), POINT_D),
        // top branch
        new LineSegment(new Point(2, 1), POINT_E),
        new LineSegment(new Point(3, 2), POINT_F),
      ];
      expect(result).toEqual(expected);
    });
  });
});
