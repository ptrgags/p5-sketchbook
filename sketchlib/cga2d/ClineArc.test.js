import { describe, it, expect } from "vitest";
import { LinePrimitive } from "../primitives/LinePrimitive.js";
import { Point } from "../pga2d/Point.js";
import { ClineArc } from "./ClineArc.js";
import { Cline } from "./Cline.js";
import { Line } from "../pga2d/Line.js";
import { NullPoint } from "./NullPoint.js";
import { CGA_MATCHERS } from "../test_helpers/cga_matchers.js";

expect.extend(CGA_MATCHERS);

describe("ClineArc", () => {
  describe("primitive", () => {});
  describe("from_segment", () => {
    it("with segment computes correct cline arc", () => {
      const segment = new LinePrimitive(new Point(1, 1), new Point(1, -1));

      const result = ClineArc.from_segment(segment);

      const expected = new ClineArc(
        Cline.from_line(new Line(1, 0, 1)),
        NullPoint.from_point(new Point(1, 1)),
        NullPoint.from_point(new Point(1, 0)),
        NullPoint.from_point(new Point(1, -1)),
      );
      expect(result).toBeClineArc(expected);
    });
  });
  describe("from_arc", () => {});
});
