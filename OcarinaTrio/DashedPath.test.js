import { describe, it, expect } from "vitest";
import { DashedPath } from "./DashedPath.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { group } from "../sketchlib/primitives/shorthand.js";

// test data is a several line segments on the x-axis arranged like this
//
// 0       2   3          6
// |-------|---|----------|
// A       B   C          D
const POINT_A = Point.ORIGIN;
const POINT_B = new Point(2, 0);
const POINT_C = new Point(3, 0);
const POINT_D = new Point(6, 0);

/**
 *
 * @returns {DashedPath}
 */
function make_path() {
  return new DashedPath([
    new LineSegment(POINT_A, POINT_B),
    new LineSegment(POINT_B, POINT_C),
    new LineSegment(POINT_C, POINT_D),
  ]);
}

describe("DashedPath", () => {
  describe("update_dashes", () => {
    it("before call to update_dashes produces empty primitive", () => {
      const path = make_path();

      const result = path.primitive;

      const expected = group();
      expect(result).toEqual(expected);
    });

    it("with no path segments does nothing", () => {
      const path = new DashedPath([]);

      path.update_dashes([[1, 10]]);
      const result = path.primitive;

      const expected = group();
      expect(result).toEqual(expected);
    });

    it("with empty list of intervals produces no segments", () => {
      const path = make_path();

      path.update_dashes([]);
      const result = path.primitive;

      const expected = group();
      expect(result).toEqual(expected);
    });

    it("with empty query after non-empty query resets primitive", () => {
      const path = make_path();

      // set a non-empty query
      path.update_dashes([[0, 2.5]]);
      const expected_before = group(
        new LineSegment(POINT_A, POINT_B),
        new LineSegment(POINT_B, new Point(2.5, 0)),
      );
      expect(path.primitive).toEqual(expected_before);

      path.update_dashes([]);
      const result = path.primitive;

      const expected = group();
      expect(result).toEqual(expected);
    });

    it("with very long interval returns whole path", () => {
      const path = make_path();

      path.update_dashes([[-1, 10]]);
      const result = path.primitive;

      const expected = group(
        new LineSegment(POINT_A, POINT_B),
        new LineSegment(POINT_B, POINT_C),
        new LineSegment(POINT_C, POINT_D),
      );
      expect(result).toEqual(expected);
    });

    it("with interval before start returns nothing", () => {
      const path = make_path();

      path.update_dashes([[-2, -1]]);
      const result = path.primitive;

      const expected = group();
      expect(result).toEqual(expected);
    });

    it("with interval after end returns nothing", () => {
      const path = make_path();

      path.update_dashes([[7, 10]]);
      const result = path.primitive;

      const expected = group();
      expect(result).toEqual(expected);
    });

    it("ignores empty intervals", () => {
      const path = make_path();

      path.update_dashes([[1, 1]]);
      const result = path.primitive;

      const expected = group();
      expect(result).toEqual(expected);
    });

    it("ignores backwards intervals", () => {
      const path = make_path();

      path.update_dashes([[2, 1]]);
      const result = path.primitive;

      const expected = group();
      expect(result).toEqual(expected);
    });

    it("with interval inside first segment returns partial segment", () => {
      const path = make_path();

      path.update_dashes([[0.5, 1.5]]);
      const result = path.primitive;

      const expected = group(
        new LineSegment(new Point(0.5, 0), new Point(1.5, 0)),
      );
      expect(result).toEqual(expected);
    });

    it("with interval overlapping start returns partial interval", () => {
      const path = make_path();

      path.update_dashes([[-1, 1]]);
      const result = path.primitive;

      const expected = group(new LineSegment(POINT_A, new Point(1, 0)));
      expect(result).toEqual(expected);
    });

    it("with interval inside later segment returns partial interval", () => {
      const path = make_path();

      path.update_dashes([[4, 5]]);
      const result = path.primitive;

      const expected = group(new LineSegment(new Point(4, 0), new Point(5, 0)));
      expect(result).toEqual(expected);
    });

    it("with interval exactly matching some segments returns correct intervals", () => {
      const path = make_path();

      path.update_dashes([[2, 6]]);
      const result = path.primitive;

      const expected = group(
        new LineSegment(POINT_B, POINT_C),
        new LineSegment(POINT_C, POINT_D),
      );
      expect(result).toEqual(expected);
    });

    it("with interval straddling segments returns multiple segments", () => {
      const path = make_path();

      path.update_dashes([[1, 4]]);
      const result = path.primitive;

      const expected = group(
        new LineSegment(new Point(1, 0), POINT_B),
        new LineSegment(POINT_B, POINT_C),
        new LineSegment(POINT_C, new Point(4, 0)),
      );
      expect(result).toEqual(expected);
    });

    it("with intervals with gap returns correct intervals", () => {
      const path = make_path();

      path.update_dashes([
        [-1, 1],
        [4, 5],
      ]);
      const result = path.primitive;

      const expected = group(
        new LineSegment(POINT_A, new Point(1, 0)),
        new LineSegment(new Point(4, 0), new Point(5, 0)),
      );
      expect(result).toEqual(expected);
    });

    it("with multiple intervals overlapping segment returns correct segments", () => {
      const path = make_path();

      path.update_dashes([
        [2.5, 4],
        [5, 7],
      ]);
      const result = path.primitive;

      const expected = group(
        new LineSegment(new Point(2.5, 0), POINT_C),
        new LineSegment(POINT_C, new Point(4, 0)),
        new LineSegment(new Point(5, 0), POINT_D),
      );
      expect(result).toEqual(expected);
    });
  });
});
